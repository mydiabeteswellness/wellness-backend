const express = require("express");
const router = express.Router();
const { chatbot } = require("../controllers/aiController");
const { auth } = require("../middleware/auth");

router.post("/chat", auth(), chatbot);

module.exports = router;
