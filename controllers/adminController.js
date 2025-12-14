const User = require("../models/User");
const Chat = require("../models/Chat"); // assuming you have a Chat model

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
};

exports.getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  res.json(user);
};

exports.getUserChats = async (req, res) => {
  const chats = await Chat.find({ userId: req.params.id }).sort({ createdAt: -1 });
  res.json(chats);
};