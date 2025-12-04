const express = require("express");
const router = express.Router();
const {
  setPlan,
  getMyPlan,
} = require("../controllers/subscriptionController");
const { auth } = require("../middleware/auth");

router.post("/set", auth(), setPlan);
router.get("/me", auth(), getMyPlan);

module.exports = router;
