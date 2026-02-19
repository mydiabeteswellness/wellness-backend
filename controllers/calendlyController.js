const crypto = require("crypto");
const User = require("../models/User");

function verifyCalendlySignature(req) {
  const signatureHeader = req.headers["calendly-webhook-signature"];
  if (!signatureHeader) return false;

  // Parse signature header
  const elements = signatureHeader.split(",");
  const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1];
  const signatures = elements
    .filter(e => e.startsWith("v1="))
    .map(e => e.split("=")[1]);

  if (!timestamp || !signatures.length) return false;

  const payload = `${timestamp}.${req.rawBody.toString()}`;

  const expected = crypto
    .createHmac("sha256", process.env.CALENDLY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return signatures.some(sig =>
    crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expected, "hex")
    )
  );
}

const calendlyWebhook = async (req, res) => {
  console.log("📩 Calendly webhook:", req.body.event);

  // 🔐 Signature verification (PRODUCTION)
  if (!verifyCalendlySignature(req)) {
    console.error("❌ Invalid Calendly signature");
    return res.status(401).send("Invalid signature");
  }

  const { event, payload } = req.body;

  if (event === "invitee.created") {
    const answers = payload.questions_and_answers || [];

    const userId = answers.find(q => q.question === "userId")?.answer;
    const type = answers.find(q => q.question === "type")?.answer;

    if (!userId) return res.sendStatus(200);

    const user = await User.findById(userId);
    if (!user) return res.sendStatus(200);

    user.consultationUsage.usedThisMonth =
      (user.consultationUsage.usedThisMonth || 0) + 1;

    user.consultationUsage.breakdown.push({
      type: type || "Unknown",
      usedAt: new Date(),
    });

    await user.save();

    console.log("✅ Consultation deducted");
  }

  res.sendStatus(200);
};

module.exports = { calendlyWebhook };
