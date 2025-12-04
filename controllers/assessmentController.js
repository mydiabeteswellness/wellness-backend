const Assessment = require("../models/Assessment");

// Simple rule-based risk – you can later swap with AI/ML
function calculateRisk(bmi, fastingGlucose) {
  if (fastingGlucose > 125 || bmi > 30) return "high";
  if (fastingGlucose > 110 || bmi > 27) return "moderate";
  return "low";
}

exports.createAssessment = async (req, res) => {
  try {
    const { age, gender, bmi, fastingGlucose, lifestyle } = req.body;

    const riskLevel = calculateRisk(bmi, fastingGlucose);
    const summary = `Based on BMI ${bmi} and fasting glucose ${fastingGlucose}, your estimated risk is ${riskLevel}. Focus on regular activity, balanced diet, and periodic check-ups. This is not a medical diagnosis.`;

    const assessment = await Assessment.create({
      user: req.user.id,
      age,
      gender,
      bmi,
      fastingGlucose,
      lifestyle,
      riskLevel,
      summary,
    });

    res.status(201).json(assessment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getMyAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(assessments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) return res.status(404).json({ msg: "Not found" });
    if (assessment.user.toString() !== req.user.id && req.user.role === "PATIENT") {
      return res.status(403).json({ msg: "Forbidden" });
    }

    res.json(assessment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
