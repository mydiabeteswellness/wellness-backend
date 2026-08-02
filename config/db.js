const mongoose = require("mongoose");
const dns = require("dns");

// Node picks up a stale/unreachable 127.0.0.1 resolver on this machine, which
// breaks the SRV lookup mongodb+srv:// needs (ECONNREFUSED). Force a working
// resolver so the Atlas SRV record can be queried.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
