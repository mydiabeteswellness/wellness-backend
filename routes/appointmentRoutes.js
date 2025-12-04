const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  updateStatus,
} = require("../controllers/appointmentController");
const { auth } = require("../middleware/auth");

router.post("/", auth("PATIENT"), createAppointment);
router.get("/me", auth(), getMyAppointments);
router.patch("/:id/status", auth(["DOCTOR", "ADMIN"]), updateStatus);

module.exports = router;
