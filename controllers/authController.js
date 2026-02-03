const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PLANS = require("../config/plans.config");

/* =====================================================
   REGISTER USER (DEFAULT = FREE PLAN)
===================================================== */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Name, email, and password are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    const freePlan = PLANS.FREE;

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      role: role || "PATIENT",

      // 🔑 DEFAULT PLAN
      plan: "FREE",

      // 🔓 DEFAULT FEATURES
      features: freePlan.features,

      // 🧠 AI USAGE INITIALIZATION
      aiUsage: {
        baseMonthlyTokens: freePlan.aiTokens,
        tokensUsedThisMonth: 0,
        extraPurchasedTokens: 0,
        lastResetAt: new Date(),
      },

      // 🧾 PLAN HISTORY
      planHistory: [
        {
          plan: "FREE",
          activatedAt: new Date(),
          reason: "signup",
        },
      ],
    });

    return res.status(201).json({
      msg: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR 👉", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =====================================================
   LOGIN USER
===================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =====================================================
   CURRENT USER (DASHBOARD-READY)
===================================================== */
exports.me = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    /* ===============================
       SAFETY FALLBACK (VERY IMPORTANT)
       Fix users with plan = null
    =============================== */
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
