const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const plans = require("../config/razorpayPlans");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Subscription
exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body; // BASIC / MID / PREMIUM

    if (!plans[plan]) {
      return res.status(400).json({ msg: "Invalid plan" });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: plans[plan],
      customer_notify: 1,
      total_count: 12,
    });

    res.json(subscription);
  } catch (err) {
  console.error("RAZORPAY ERROR 👉", err);
  res.status(500).json({
    msg: "Subscription creation failed",
    error: err.error || err.message,
  });
}

};

// 2️⃣ Verify Payment & Activate Plan
exports.verifySubscription = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        razorpay_payment_id + "|" + razorpay_subscription_id
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    const user = await User.findById(req.user.id);

    user.plan = plan;
    user.subscription = {
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPlanId: plans[plan],
      status: "active",
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
    };

    await user.save();

    res.json({ msg: "Subscription activated", plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
