const mongoose = require("mongoose");
const User = require("../models/User");
const PLANS = require("../config/plans.config");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const freePlan = PLANS.FREE;


    console.log(freePlan)
    const result = await User.updateMany(
      { plan: null },
      {
        $set: {
          plan: "FREE",
          features: freePlan.features,
          aiUsage: {
            baseMonthlyTokens: freePlan.mdwTokens,
            tokensUsedThisMonth: 0,
            extraPurchasedTokens: 0,
            lastResetAt: new Date(),
          },
          "subscription.status": "none",
        },
      }
    );

    console.log("Migration completed:", result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
