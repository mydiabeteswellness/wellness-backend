const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    dailyChatsUsed: { type: Number, default: 0 },
    lastChatDate: { type: String, default: "" },

    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"],
      default: "PATIENT",
    },

    plan: {
      type: String,
      enum: ["BASIC", "MID", "PREMIUM", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
