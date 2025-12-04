const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chatbot = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    // ---- OpenAI Structured Response ---- //
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",

      text: {
        format: {
          type: "json_schema",
          name: "diabetes_wellness_response",
          schema: {
            type: "object",
            additionalProperties: false, 
            properties: {
              summary: { type: "string" },
              causes: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } }
            },
            required: ["summary", "recommendations"]
          }
        }
      },

      input: [
        {
          role: "system",
          content: `
You are a Diabetes Wellness Assistant.

✔ Provide lifestyle, diet, stress, sleep, habit and diabetes-friendly guidance.
✔ NO diagnosis or emergency advice.
✔ ALWAYS tell users to consult their doctor for medical decisions.

If user asks anything unrelated (coding, movies, crypto etc), reply with:

{
 "summary": "I can only help with diabetes wellness, lifestyle and healthy living.",
 "causes": [],
 "recommendations": ["Please ask something related to diabetes or lifestyle."],
 "warnings": []
}
`
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(context || {})}
Question: ${message}`
        }
      ]
    });

    // Extract JSON from new API structure
    const jsonText = completion.output[0].content[0].text;
    const aiResponse = JSON.parse(jsonText);

    return res.json({ reply: aiResponse });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({ msg: "AI error" });
  }
};
