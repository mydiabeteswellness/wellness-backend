const User = require("../models/User");

exports.setPlan = async (req, res) => {
  try {
    const { plan } = req.body; // BASIC / MID / PREMIUM

    const allowed = ["BASIC", "MID", "PREMIUM"];
    if (!allowed.includes(plan)) {
      return res.status(400).json({ msg: "Invalid plan" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { plan },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getMyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("plan");
    res.json({ plan: user.plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
