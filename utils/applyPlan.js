// utils/applyPlan.js
const PLANS = require("../config/plans.config");

module.exports = function applyPlan(user, planKey = "FREE") {
  const plan = PLANS[planKey];

  if (!plan) {
    throw new Error(`Invalid plan key: ${planKey}`);
  }

  user.plan = planKey;

  user.features = plan.features || {};

  user.aiUsage = {
    baseMonthlyTokens: plan.mdwTokens || 0,
    tokensUsedThisMonth: 0,
    extraPurchasedTokens: 0,
    lastResetAt: new Date(),
  };

  user.subscription = {
    status: "none",
  };

  user.planHistory = [
    {
      plan: planKey,
      activatedAt: new Date(),
      reason: "auto-assign",
    },
  ];
};
