const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    /* ======================
       BASIC IDENTITY
    ====================== */
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, required: true },

    isVerified: { type: Boolean, default: false },

    authProvider: {
      type: String,
      enum: ["EMAIL_OTP"],
      default: "EMAIL_OTP",
    },

    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"],
      default: "PATIENT",
    },

    /* ======================
       CURRENT PLAN (ACTIVE)
    ====================== */
    plan: {
      type: String,
      enum: ["FREE", "BASIC", "MID", "PREMIUM"],
      default: "FREE",
    },

    /* ======================
       FEATURE PRIVILEGES
    ====================== */
    features: {
      aiHealthInsights: { type: Boolean, default: false },
      dietRecommendations: { type: Boolean, default: false },
      bloodSugarTracking: { type: Boolean, default: false },
      educationalContent: { type: Boolean, default: false },
      communityAccess: { type: Boolean, default: false },

      doctorConsultation: { type: Boolean, default: false },
      personalizedMealPlans: { type: Boolean, default: false },
      exerciseRecommendations: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },

      supplementPlan: { type: Boolean, default: false },
      chatSupport247: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      careCoordinator: { type: Boolean, default: false },
    },

    /* ======================
       AI CHAT / TOKEN SYSTEM
    ====================== */
    aiUsage: {
      baseMonthlyTokens: { type: Number, default: 0 },
      extraPurchasedTokens: { type: Number, default: 0 },
      tokensUsedThisMonth: { type: Number, default: 0 },
      lastResetAt: { type: Date },
    },

    /* ======================
       SUBSCRIPTION DETAILS
    ====================== */
    subscription: {
      razorpayCustomerId: String,
      razorpaySubscriptionId: String,
      razorpayPlanId: String,

      status: {
        type: String,
        enum: ["none", "created", "active", "cancelled", "expired"],
        default: "none",
      },

      startedAt: Date,
      currentPeriodEnd: Date,
      cancelledAt: Date,
      autoRenew: { type: Boolean, default: true },
    },

    /* ======================
       PLAN HISTORY
    ====================== */
    planHistory: [
      {
        plan: {
          type: String,
          enum: ["FREE", "BASIC", "MID", "PREMIUM"],
          default: "FREE",
        },
        activatedAt: Date,
        expiredAt: Date,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
