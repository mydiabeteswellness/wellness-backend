// config/plans.config.js

const PLANS = {
  FREE: {
    price: 0,
    aiTokens: 2000,
    features: {
      aiHealthInsights: true,
      educationalContent: true,
      communityAccess: true,
    },
  },

  BASIC: {
    price: 750,
    aiTokens: 10000,
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
    aiTokens: 50000,
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
    aiTokens: 150000,
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
