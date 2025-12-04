const express = require("express");
const router = express.Router();
const {
  createAssessment,
  getMyAssessments,
  getAssessmentById,
} = require("../controllers/assessmentController");
const { auth } = require("../middleware/auth");

router.post("/", auth("PATIENT"), createAssessment);
router.get("/", auth(), getMyAssessments);
router.get("/:id", auth(), getAssessmentById);

module.exports = router;
