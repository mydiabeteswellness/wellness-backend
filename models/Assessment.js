const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    age: Number,
    gender: String,
    bmi: Number,
    fastingGlucose: Number,
    lifestyle: String,  // e.g. "sedentary", "active"
    riskLevel: String,  // low / moderate / high
    summary: String     // AI or rule-based explanation
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", AssessmentSchema);
