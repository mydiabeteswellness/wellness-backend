const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  createSubscription,
  verifySubscription,
} = require("../controllers/subscriptionController");

// user must be logged in (any role)
router.post("/create", auth(), createSubscription);
router.post("/verify", auth(), verifySubscription);

module.exports = router;
