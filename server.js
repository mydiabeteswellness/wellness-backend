const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const createSuperAdmin = require("./utils/createSuperAdmin");
dotenv.config();
createSuperAdmin();
connectDB();

const app = express();

// ✅ FIXED CORS — handles preflight + correct domains
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://mdw.companyprofile.in",
      "https://seashell-app-zv5w9.ondigitalocean.app",
      "https://diabeteswellnes.online",
      "https://www.diabeteswellnes.online",
      "https://mydiabeteswellness.health",
      "https://www.mydiabeteswellness.health",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
// ✅ VERY IMPORTANT — handles OPTIONS requests
app.options("*", cors({
  origin: [
    "http://localhost:3000",
    "https://mdw.companyprofile.in",
    "https://seashell-app-zv5w9.ondigitalocean.app",
    "https://diabeteswellnes.online",
    "https://www.diabeteswellnes.online",
    "https://mydiabeteswellness.health",
    "https://www.mydiabeteswellness.health",
  ],
  credentials: true,
}));


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
app.use("/api/plans", require("./routes/planRoutes"));

app.use("/api/consultation", require("./routes/consultationRoutes"));
app.use("/api/webhooks", require("./routes/calendly.webhook.routes"));


console.log("MSG91 KEY:", process.env.MSG91_AUTH_KEY ? "LOADED" : "MISSING");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
console.log("code checking : 21432802")
