const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { sendMessage, getHistory, resetChat } = require("../controllers/chatController");

router.post("/send", auth(["PATIENT", "DOCTOR", "ADMIN"]), sendMessage);
router.get("/history", auth(["PATIENT", "DOCTOR", "ADMIN"]), getHistory);
router.delete("/reset", auth(["PATIENT"]), resetChat);

module.exports = router;
