const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth(), me);

router.post("/send-email-otp", authController.sendEmailOtp);
router.post("/verify-email-otp", authController.verifyEmailOtp);


module.exports = router;
