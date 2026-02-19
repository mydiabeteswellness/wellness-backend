const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const {
  checkEligibility,
  getBookingUrl,
} = require("../controllers/consultationController");

/* ==========================
   CHECK LIMIT
========================== */
router.get("/eligibility", auth(), checkEligibility);

/* ==========================
   GET BOOKING LINK
========================== */
router.post("/book", auth(), getBookingUrl);

module.exports = router;
