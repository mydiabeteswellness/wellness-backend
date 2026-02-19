const User = require("../models/User");

/* ==========================
   CHECK ELIGIBILITY
========================== */
const checkEligibility = async (req, res) => {
  const user = await User.findById(req.user.id);

  const remaining =
    user.consultationEntitlements.monthlyLimit -
    user.consultationUsage.usedThisMonth;

  if (remaining <= 0) {
    return res.status(403).json({
      allowed: false,
      message: "Consultation limit reached",
    });
  }

  res.json({
    allowed: true,
    remaining,
    allowedTypes: user.consultationEntitlements.includes,
  });
};

/* ==========================
   GENERATE BOOKING URL
========================== */
const getBookingUrl = async (req, res) => {
  const { type } = req.body;

  const user = await User.findById(req.user.id);

  const remaining =
    user.consultationEntitlements.monthlyLimit -
    user.consultationUsage.usedThisMonth;

  if (remaining <= 0) {
    return res.status(403).json({ message: "Limit reached" });
  }

  const baseUrl =
    type === "Doctor Consultation"
      ? process.env.CALENDLY_DOCTOR
      : process.env.CALENDLY_DIETITIAN;

  const url =
    `${baseUrl}?name=${user.name}` +
    `&email=${user.email}` +
    `&customAnswers[userId]=${user._id}` +
    `&customAnswers[type]=${type}`;

  res.json({ url });
};

module.exports = {
  checkEligibility,
  getBookingUrl,
};
