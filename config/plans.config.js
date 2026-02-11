// config/plans.config.js

const PLANS = {
  FREE: {
    price: 0,
    consultation: {
      monthly: 0,
      includes: ["Call to Expert"],
    },
    mdwTokens: 20000,
    features: {
      aiHealthInsights: true,
      educationalContent: true,
      communityAccess: true,
    },
    highlight: "Explore diabetes care with expert guidance",
  },

  BASIC: {
    price: 750,
    consultation: {
      monthly: 1,
      includes: ["Dietitian Consultation"],
    },
    mdwTokens: 30000,
    features: {
      aiHealthInsights: true,
      dietRecommendations: true,
      bloodSugarTracking: true,
      educationalContent: true,
      communityAccess: true,
    },
    highlight: "Start your diabetes journey with a dietitian",
  },

  MID: {
    price: 1800,
    consultation: {
      monthly: 2,
      includes: [
        "Doctor Consultation",
        "Dietitian Consultation",
      ],
    },
    mdwTokens: 90000,
    features: {
      aiHealthInsights: true,
      dietRecommendations: true,
      bloodSugarTracking: true,
      educationalContent: true,
      communityAccess: true,

      personalizedMealPlans: true,
      exerciseRecommendations: true,
      prioritySupport: true,
    },
    highlight: "Medical + nutritional care for better control",
  },

  PREMIUM: {
    price: 3600,
    consultation: {
      monthly: 3,
      includes: [
        "Doctor Consultation",
        "Dietitian Consultation",
        "Health Coach Consultation",
      ],
    },
    mdwTokens: 300000,
    features: {
      aiHealthInsights: true,
      dietRecommendations: true,
      bloodSugarTracking: true,
      educationalContent: true,
      communityAccess: true,

      personalizedMealPlans: true,
      exerciseRecommendations: true,
      prioritySupport: true,

      advancedAnalytics: true,
      careCoordinator: true,
      chatSupport247: true,
    },
    highlight: "Complete diabetes care with dedicated experts",
  },
};

module.exports = PLANS;
