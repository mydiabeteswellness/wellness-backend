const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAllUsers,
  getUserChats,
} = require("../controllers/adminController");

router.get("/users", auth(["ADMIN", "SUPER_ADMIN"]), getAllUsers);
router.get("/chats/:userId", auth(["ADMIN", "SUPER_ADMIN"]), getUserChats);

module.exports = router;
