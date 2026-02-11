require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const PLANS = require("../config/plans.config");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const planKey of Object.keys(PLANS)) {
      const planConfig = PLANS[planKey];

      const result = await User.updateMany(
        { plan: planKey },
        {
          $set: {
            "aiUsage.baseMonthlyTokens": planConfig.mdwTokens,
            features: planConfig.features,
          },
        }
      );

      console.log(
        `✅ ${planKey}: updated ${result.modifiedCount} users`
      );
    }

    console.log("🎉 All users synced with plan config");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
})();
