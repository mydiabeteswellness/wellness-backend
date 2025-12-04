const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👉 PUT THIS EXACTLY HERE
app.get("/", (req, res) => {
  res.send("Diabetes Wellness Backend API is running ✅");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/assessments", require("./routes/assessmentRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
