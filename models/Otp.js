const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  identifier: String, // email
  otp: String,
  expiresAt: Date,
});

module.exports = mongoose.model("Otp", otpSchema);
