const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

const RAZORPAY_PLANS = require("../config/razorpayPlans");
const PLANS = require("../config/plans.config");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =====================================================
   1️⃣ CREATE SUBSCRIPTION (PAID PLANS ONLY)
===================================================== */
exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body; // BASIC | MID | PREMIUM

    if (!RAZORPAY_PLANS[plan]) {
      return res.status(400).json({ msg: "Invalid plan selected" });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: RAZORPAY_PLANS[plan],
      customer_notify: 1,
      total_count: 12, // 12 months
    });

    return res.json({
      subscriptionId: subscription.id,
      plan,
    });
  } catch (err) {
    console.error("RAZORPAY CREATE ERROR 👉", err);
    return res.status(500).json({
      msg: "Subscription creation failed",
    });
  }
};

/* =====================================================
   2️⃣ VERIFY PAYMENT & ACTIVATE / UPGRADE PLAN
===================================================== */
exports.verifySubscription = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan,
    } = req.body;

    /* ---------- Signature Verification ---------- */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_payment_id}|${razorpay_subscription_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ msg: "Invalid plan configuration" });
    }

    /* ---------- Save Old Plan to History ---------- */
    if (user.plan) {
      user.planHistory.push({
        plan: user.plan,
        activatedAt: user.subscription?.startedAt || user.createdAt,
        expiredAt: new Date(),
        reason: "upgrade",
      });
    }

    /* ---------- Apply New Plan ---------- */
    user.plan = plan;

    user.features = {
      ...user.features,
      ...planConfig.features,
    };

    user.aiUsage.baseMonthlyTokens = planConfig.aiTokens;
    user.aiUsage.tokensUsedThisMonth = 0;
    user.aiUsage.extraPurchasedTokens = 0;
    user.aiUsage.lastResetAt = new Date();

    user.subscription = {
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPlanId: RAZORPAY_PLANS[plan],
      status: "active",
      startedAt: new Date(),
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      autoRenew: true,
    };

    await user.save();

    return res.json({
      msg: "Subscription activated successfully",
      plan,
      features: user.features,
      aiTokens: planConfig.aiTokens,
      nextRenewal: user.subscription.currentPeriodEnd,
    });
  } catch (err) {
    console.error("VERIFY ERROR 👉", err);
    return res.status(500).json({ msg: "Server error" });
  }
};


// ===============================
// RAZORPAY WEBHOOK HANDLER
// ===============================
exports.handleWebhook = async (req, res) => {
  try {
    const crypto = require("crypto");
    const User = require("../models/User");
    const PLANS = require("../config/plans.config");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const razorpaySignature = req.headers["x-razorpay-signature"];

    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).send("Invalid webhook signature");
    }

    const event = req.body.event;
    const payload = req.body.payload;

    /* ===============================
       SUBSCRIPTION ACTIVATED
    =============================== */
    if (event === "subscription.activated") {
      const subscriptionId = payload.subscription.entity.id;

      const user = await User.findOne({
        "subscription.razorpaySubscriptionId": subscriptionId,
      });

      if (user) {
        user.subscription.status = "active";
        await user.save();
      }
    }

    /* ===============================
       PAYMENT FAILED / CANCELLED
    =============================== */
    if (
      event === "subscription.cancelled" ||
      event === "payment.failed"
    ) {
      const subscriptionId = payload.subscription.entity.id;

      const user = await User.findOne({
        "subscription.razorpaySubscriptionId": subscriptionId,
      });

      if (user) {
        // 🔻 Downgrade to FREE
        user.plan = "FREE";
        user.features = PLANS.FREE.features;
        user.aiUsage.baseMonthlyTokens = PLANS.FREE.aiTokens;
        user.subscription.status = "expired";

        user.planHistory.push({
          plan: "FREE",
          activatedAt: new Date(),
          reason: "payment_failed_or_cancelled",
        });

        await user.save();
      }
    }

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("WEBHOOK ERROR 👉", err);
    return res.status(500).send("Webhook error");
  }
};
