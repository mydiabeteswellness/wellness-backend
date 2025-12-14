const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const createSuperAdmin = require("./utils/createSuperAdmin");
createSuperAdmin();
dotenv.config();
connectDB();

const app = express();

// ✅ FIXED CORS — handles preflight + correct domains
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://mdw.companyprofile.in",
      "https://seashell-app-zv5w9.ondigitalocean.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ VERY IMPORTANT — handles OPTIONS requests
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.send("Diabetes Wellness Backend API is running ✅");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/assessments", require("./routes/assessmentRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
