const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PLANS = require("../config/plans.config");
const generateOtp = require("../utils/generateOtp");
const Otp = require("../models/Otp");
const sendOtpEmail = require("../services/emailServices");

exports.me = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (!user.plan) {
      const freePlan = PLANS.FREE;

      user.plan = "FREE";
      user.features = freePlan.features;
      user.aiUsage = {
        baseMonthlyTokens: freePlan.aiTokens,
        tokensUsedThisMonth: 0,
        extraPurchasedTokens: 0,
        lastResetAt: new Date(),
      };

      user.subscription = {
        status: "none",
      };

      user.planHistory = [
        {
          plan: "FREE",
          activatedAt: new Date(),
          reason: "auto-fix",
        },
      ];

      await user.save();
    }

    const totalTokens =
      user.aiUsage.baseMonthlyTokens +
      user.aiUsage.extraPurchasedTokens;

    const remainingTokens =
      totalTokens - user.aiUsage.tokensUsedThisMonth;

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        features: user.features,
        subscription: user.subscription,
        aiUsage: {
          totalTokens,
          used: user.aiUsage.tokensUsedThisMonth,
          remaining: remainingTokens,
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = generateOtp();

    // OPTIONAL but recommended: remove old OTPs
    await Otp.deleteMany({ identifier: email });

    await Otp.create({
      identifier: email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 🔥 MUST be awaited + error-handled
    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent",
    });
  } catch (error) {
    console.error("SEND EMAIL OTP ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};




exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    // 🔑 Ensure OTP is string-safe
    const record = await Otp.findOne({
      identifier: email,
      otp: String(otp),
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await Otp.deleteMany({ identifier: email });

    // 🔍 USER MUST EXIST
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please sign up.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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

    await sendOtpEmail(email, otp);

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

    const record = await Otp.findOne({ identifier: email, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (!record.payload) {
      return res.status(400).json({
        success: false,
        message: "Registration data missing. Please register again.",
      });
    }

    const { name, mobile, role } = record.payload;

    const user = await User.create({
      name,
      email,
      mobile,
      role: role || "PATIENT",
      plan: "FREE",
      isVerified: true,
    });

    await Otp.deleteMany({ identifier: email });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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

