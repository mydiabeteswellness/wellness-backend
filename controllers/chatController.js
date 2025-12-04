const Chat = require("../models/Chat");
const User = require("../models/User");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DAILY LIMIT
const FREE_LIMIT = 3;

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ msg: "Message cannot be empty" });
    }

    if (message.length > 200) {
      return res.status(400).json({
        msg: "Please enter a shorter message (max 200 characters)",
      });
    }

    // ---------------------------
    // DAILY RESET LOGIC
    // ---------------------------
    const today = new Date().toISOString().slice(0, 10);

    if (user.lastChatDate !== today) {
      user.dailyChatsUsed = 0;
      user.lastChatDate = today;
      await user.save();
    }

    // ---------------------------
    // LIMIT CHECK BEFORE ANYTHING
    // ---------------------------
    if (user.plan === null && user.dailyChatsUsed >= FREE_LIMIT) {
      return res.status(403).json({
        msg: "Daily free chat limit exhausted",
        limitReached: true,
      });
    }

    // Load or create chat
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = await Chat.create({ user: userId, messages: [] });
    }

    // Count user chat messages
    const userMsgCount = chat.messages.filter((m) => m.role === "user").length;

    if (user.plan === null && userMsgCount >= FREE_LIMIT) {
      return res.status(403).json({
        msg: "Chat limit reached",
        limitReached: true,
      });
    }

    // ---------------------------
    // SAVE USER MESSAGE

    chat.messages.push({ role: "user", content: message });
    await chat.save();

    // Increase daily usage
    user.dailyChatsUsed += 1;
    await user.save();

    // ---------------------------
    // OPENAI RESPONSE
    // ---------------------------
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 100, // cost optimization
      messages: [
        {
          role: "system",
          content: `
You are a Diabetes Wellness & Lifestyle Assistant.
ONLY answer questions about:

✔ Diabetes  
✔ Obesity  
✔ Metabolism  
✔ Diet  
✔ Lifestyle  
✔ Exercise  
✔ Sleep  
✔ Stress  

❌ Do NOT answer unrelated topics like coding, crypto, movies.
Respond with: 
"I'm here only for diabetes wellness and health support. Please ask something health-related."

Keep responses short (under 100 tokens).
          `,
        },
        ...chat.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const aiReply = completion.choices[0].message.content;

    // Save AI message
    chat.messages.push({ role: "assistant", content: aiReply });
    await chat.save();

    return res.json({
      reply: aiReply,
      limitReached: false,
    });
  } catch (err) {
    console.log("CHAT ERROR:", err);
    return res.status(500).json({ msg: "AI error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user.id });
    if (!chat) return res.json({ messages: [] });

    res.json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resetChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ user: req.user.id });
    res.json({ msg: "Chat cleared" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
