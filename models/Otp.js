const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true },
    otp: { type: String, required: true },

    type: {
      type: String,
      enum: ["REGISTER", "LOGIN"],
    },

    payload: {
      type: Object, // 🔥 THIS WAS MISSING
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", OtpSchema);
