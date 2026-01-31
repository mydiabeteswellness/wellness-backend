const Chat = require("../models/Chat");
const User = require("../models/User");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =====================================================
   SEND MESSAGE
===================================================== */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { message } = req.body;

    /* ---------------------------
       VALIDATION
    --------------------------- */
    if (!message || message.trim() === "") {
      return res.status(400).json({ msg: "Message cannot be empty" });
    }

    if (message.length > 500) {
      return res.status(400).json({
        msg: "Please enter a shorter message (max 500 characters)",
      });
    }

    /* ---------------------------
       FEATURE ACCESS CHECK
    --------------------------- */
    if (!user.features?.aiHealthInsights) {
      return res.status(403).json({
        msg: "AI health insights not available on your plan",
        upgradeRequired: true,
      });
    }

    /* ---------------------------
       TOKEN LIMIT CHECK
    --------------------------- */
    const totalAllowedTokens =
      user.aiUsage.baseMonthlyTokens +
      user.aiUsage.extraPurchasedTokens;

    const remainingTokens =
      totalAllowedTokens - user.aiUsage.tokensUsedThisMonth;

    // Hard stop if exhausted
    if (remainingTokens <= 0) {
      return res.status(403).json({
        msg: "AI chat limit exhausted. Please upgrade or buy add-ons.",
        limitReached: true,
      });
    }

    /* ---------------------------
       LOAD OR CREATE CHAT
    --------------------------- */
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = await Chat.create({ user: userId, messages: [] });
    }

    /* ---------------------------
       SAVE USER MESSAGE
    --------------------------- */
    chat.messages.push({ role: "user", content: message });
    await chat.save();

    /* ---------------------------
       OPENAI RESPONSE
    --------------------------- */
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: Math.min(500, remainingTokens), // safety
      messages: [
        {
          role: "system",
          content: `
You are a friendly Diabetes Wellness Assistant.

Speak like a caring human health coach.
Use very simple, easy English.
Short sentences. No medical jargon.

You help with:
- Diabetes
- Blood sugar control
- Diet & food habits
- Weight & metabolism
- Walking, exercise
- Sleep & stress

If someone asks anything outside health, politely say:
"I can help only with diabetes and health-related questions."

Rules:
- Keep answers short and practical
- Never give medical diagnosis
- Encourage healthy daily habits
          `,
        },
        ...chat.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const aiReply = completion.choices[0].message.content;

    /* ---------------------------
       TOKEN USAGE CALCULATION
    --------------------------- */
    const tokensUsed =
      completion.usage?.total_tokens || 0;

    user.aiUsage.tokensUsedThisMonth += tokensUsed;

    /* ---------------------------
       SAVE AI MESSAGE
    --------------------------- */
    chat.messages.push({
      role: "assistant",
      content:
        aiReply +
        "\n\n⚠️ This is general wellness guidance. Please consult your doctor for medical advice.",
    });

    await chat.save();
    await user.save();

    /* ---------------------------
       RESPONSE
    --------------------------- */
    return res.json({
      reply: aiReply,
      plan: user.plan,
      tokensUsed,
      tokensRemaining:
        totalAllowedTokens - user.aiUsage.tokensUsedThisMonth,
      upgradeSuggested:
        user.plan === "FREE",
    });
  } catch (err) {
    console.error("CHAT ERROR 👉", err);
    return res.status(500).json({ msg: "AI error" });
  }
};

/* =====================================================
   GET CHAT HISTORY
===================================================== */
exports.getHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user.id });
    if (!chat) return res.json({ messages: [] });

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =====================================================
   RESET CHAT
===================================================== */
exports.resetChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ user: req.user.id });
    res.json({ msg: "Chat cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
