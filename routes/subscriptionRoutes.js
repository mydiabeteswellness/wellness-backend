const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { auth } = require("../middleware/auth");

/* EXISTING ROUTES */
router.post("/create", auth(), subscriptionController.createSubscription);
router.post("/verify", auth(), subscriptionController.verifySubscription);

/* ===============================
   WEBHOOK ROUTE (NEW)
=============================== */
router.post(
  "/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  subscriptionController.handleWebhook
);

module.exports = router;
