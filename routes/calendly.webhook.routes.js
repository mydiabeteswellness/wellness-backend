const express = require("express");
const router = express.Router();

const { calendlyWebhook } = require("../controllers/calendlyController");

/* ==========================
   CALENDLY WEBHOOK
========================== */
router.post(
  "/calendly",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  calendlyWebhook
);

module.exports = router;
