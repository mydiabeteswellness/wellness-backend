const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    /* ======================
       BASIC IDENTITY
    ====================== */
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String },

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
       CURRENT PLAN
    ====================== */
    plan: {
      type: String,
      enum: ["FREE", "BASIC", "MID", "PREMIUM"],
      default: "FREE",
    },

    /* ======================
       CONSULTATION ENTITLEMENTS
    ====================== */
    consultationEntitlements: {
      monthlyLimit: { type: Number, default: 0 },
      includes: [
        {
          type: String,
          enum: [
            "Call to Expert",
            "Dietitian Consultation",
            "Doctor Consultation",
            "Health Coach Consultation",
          ],
        },
      ],
    },

    /* ======================
       CONSULTATION USAGE
    ====================== */
    consultationUsage: {
      usedThisMonth: { type: Number, default: 0 },
      breakdown: [
        {
          type: {
            type: String,
            enum: [
              "Call to Expert",
              "Dietitian Consultation",
              "Doctor Consultation",
              "Health Coach Consultation",
            ],
          },
          usedAt: { type: Date, default: Date.now },
        },
      ],
      lastResetAt: Date,
    },

    /* ======================
       CALL TO EXPERT
    ====================== */
    callToExpert: {
      enabled: { type: Boolean, default: false },
      lastCalledAt: Date,
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

      personalizedMealPlans: { type: Boolean, default: false },
      exerciseRecommendations: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },

      advancedAnalytics: { type: Boolean, default: false },
      careCoordinator: { type: Boolean, default: false },
      chatSupport247: { type: Boolean, default: false },
    },

    /* ======================
       AI TOKENS
    ====================== */
    aiUsage: {
      baseMonthlyTokens: { type: Number, default: 0 },
      extraPurchasedTokens: { type: Number, default: 0 },
      tokensUsedThisMonth: { type: Number, default: 0 },
      lastResetAt: Date,
    },

    /* ======================
       SUBSCRIPTION
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
