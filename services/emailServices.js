const fetch = require("node-fetch");

const sendOtpEmail = async ({ email, name = "User", otp }) => {
  const url = "https://control.msg91.com/api/v5/email/send";

  const body = {
    recipients: [
      {
        to: [{ email, name }],
        variables: {
          VAR1: name,
          VAR2: otp,
          VAR3: "5",
        },
      },
    ],
    from: {
      email: "info@mydiabeteswellness.health",
      name: "My Diabetes Wellness",
    },
    reply_to: {
      email: "info@mydiabeteswellness.health",
    },
    domain: "mydiabeteswellness.health",

    // ✅ YOUR VERIFIED TEMPLATE
    template_id: "mdw_login_",
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authkey: process.env.MSG91_AUTHKEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok || data?.status === "error") {
      console.error("❌ MSG91 ERROR:", data);
      throw new Error("Email send failed");
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = sendOtpEmail;
