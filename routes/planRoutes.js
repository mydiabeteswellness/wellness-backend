const express = require("express");
const router = express.Router();
const PLANS = require("../config/plans.config");

// PUBLIC — no auth needed
router.get("/", (req, res) => {
  res.json(PLANS);
});

module.exports = router;
