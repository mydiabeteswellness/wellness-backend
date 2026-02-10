// config/plans.config.js

const PLANS = {
  FREE: {
    price: 0,
    aiTokens: 20000,
    features: {
      aiHealthInsights: true,
      educationalContent: true,
      communityAccess: true,
    },
  },

  BASIC: {
    price: 750,
    aiTokens: 30000,
    features: {
      aiHealthInsights: true,
      dietRecommendations: true,
      bloodSugarTracking: true,
      educationalContent: true,
      communityAccess: true,
    },
  },

  MID: {
    price: 1800,
    aiTokens: 90000,
    features: {
      aiHealthInsights: true,
      dietRecommendations: true,
      bloodSugarTracking: true,
      educationalContent: true,
      communityAccess: true,

      doctorConsultation: true,
      personalizedMealPlans: true,
      exerciseRecommendations: true,
      prioritySupport: true,
    },
  },

  PREMIUM: {
    price: 3600,
    aiTokens: 300000,
    features: {
      aiHealthInsights: true,
      dietRecommendations: true,
      bloodSugarTracking: true,
      educationalContent: true,
      communityAccess: true,

      doctorConsultation: true,
      personalizedMealPlans: true,
      exerciseRecommendations: true,
      prioritySupport: true,

      supplementPlan: true,
      chatSupport247: true,
      advancedAnalytics: true,
      careCoordinator: true,
    },
  },
};

module.exports = PLANS;
