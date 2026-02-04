const express = require("express");
const router = express.Router();

const {
  sendRegisterOtp,
  verifyRegisterOtp,
  sendEmailOtp,
  verifyEmailOtp,
  me,
} = require("../controllers/authController");

const { auth } = require("../middleware/auth");

/* ==========================
   REGISTER (OTP ONLY)
========================== */
router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);

/* ==========================
   LOGIN (OTP ONLY)
========================== */
router.post("/login/send-otp", sendEmailOtp);
router.post("/login/verify-otp", verifyEmailOtp);

/* ==========================
   CURRENT USER
========================== */
router.get("/me", auth(), me);

module.exports = router;
