const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PLANS = require("../config/plans.config");
const generateOtp = require("../utils/generateOtp");
const Otp = require("../models/Otp");
const sendOtpEmail = require("../services/emailServices");
require("dotenv").config();
const applyPlan = require("../utils/applyPlan");

exports.me = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔥 AUTO-FIX USERS WITH BROKEN PLAN DATA
    if (
      !user.plan ||
      !user.features ||
      !user.aiUsage ||
      user.aiUsage.baseMonthlyTokens === 0
    ) {
      applyPlan(user, user.plan || "FREE");
      await user.save();
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        plan: user.plan,

        /* ✅ REQUIRED BY UI */
        consultationEntitlements: user.consultationEntitlements,

        features: user.features,

        aiUsage: {
          baseMonthlyTokens: user.aiUsage.baseMonthlyTokens,
          extraPurchasedTokens: user.aiUsage.extraPurchasedTokens,
          tokensUsedThisMonth: user.aiUsage.tokensUsedThisMonth,
        },

        subscription: {
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
        },

        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("ME ERROR 👉", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.sendEmailOtp = async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log(req.body);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 🔥 DEV TEST EMAIL BYPASS (ONLY FOR DEVELOPMENT)
    if (
      process.env.NODE_ENV !== "production" &&
      cleanEmail === process.env.TEST_EMAIL?.trim().toLowerCase()
    ) {
      return res.json({
        success: true,
        message: "Test OTP sent",
      });
    }

    // ✅ Normal Flow
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please sign up.",
      });
    }
    const userName = user.name;

    const firstName = user.name?.split(" ")[0] || "User";

    const otp = generateOtp();

    await Otp.deleteMany({ identifier: cleanEmail });

    await Otp.create({
      identifier: cleanEmail,
      otp: String(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(firstName, cleanEmail, otp);

    return res.json({
      success: true,
      message: "OTP sent to registered email",
    });
  } catch (error) {
    console.error("SEND EMAIL OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { name, email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // 🔥 DEV TEST LOGIN (SAFE)
    if (
      process.env.NODE_ENV !== "production" &&
      cleanEmail === process.env.TEST_EMAIL?.trim().toLowerCase() &&
      cleanOtp === String(process.env.TEST_OTP).trim()
    ) {
      let user = await User.findOne({ email: cleanEmail });

      if (!user) {
        user = new User({
          name: "Test Basic User",
          email: cleanEmail,
          mobile: "9999999999",
          role: "PATIENT",
          isVerified: true,
        });

        applyPlan(user, "FREE");
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.json({
        success: true,
        token,
        user,
      });
    }

    // ✅ NORMAL OTP FLOW
    const record = await Otp.findOne({
      identifier: cleanEmail,
      otp: cleanOtp,
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await Otp.deleteMany({ identifier: cleanEmail });

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please sign up.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("VERIFY EMAIL OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

exports.sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, mobile, role } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email and mobile are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already registered. Please login.",
      });
    }

    const otp = generateOtp();

    await Otp.deleteMany({ identifier: email });

    await Otp.create({
      identifier: email,
      otp,
      payload: { name, email, mobile, role },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const userName = user.name;
    const firstName = user.name?.split(" ")[0] || "User";

    await sendOtpEmail(firstName, email, otp);

    return res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error("REGISTER OTP ERROR 👉", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ identifier: email, otp: String(otp) });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (!record.payload) {
      return res.status(400).json({
        success: false,
        message: "Registration data missing",
      });
    }

    const { name, mobile, role } = record.payload;

    const user = new User({
      name,
      email,
      mobile,
      role: role || "PATIENT",
      isVerified: true,
    });

    // ✅ APPLY FREE PLAN PROPERLY
    applyPlan(user, "FREE");

    await user.save();
    await Otp.deleteMany({ identifier: email });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error("VERIFY REGISTER OTP ERROR 👉", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

console.log({
  sendRegisterOtp: typeof exports.sendRegisterOtp,
  verifyRegisterOtp: typeof exports.verifyRegisterOtp,
  sendEmailOtp: typeof exports.sendEmailOtp,
  verifyEmailOtp: typeof exports.verifyEmailOtp,
});

// console.log("OTP RECORD FOUND:", record);
