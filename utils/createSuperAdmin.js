require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  const exists = await User.findOne({ email });
  if (exists) return;

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name: "Super Admin",
    email,
    passwordHash: hashed,
    role: "SUPER_ADMIN"
  });

  console.log("🌟 Super Admin Created!");
  console.log("bug fix 1126151225");
}

module.exports = createSuperAdmin;