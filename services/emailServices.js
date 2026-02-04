const fetch = require("node-fetch");

const sendOtpEmail = async ({ email, name = "User", otp }) => {
  const url = "https://control.msg91.com/api/v5/email/send";

  const body = {
    recipients: [
      {
        to: [
          {
            email,
            name,
          },
        ],
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
    template_id: "mdw_login_",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authkey: process.env.MSG91_AUTHKEY,
    },
    body: JSON.stringify(body),
    timeout: 10000, // 10s safety timeout
  });

  const data = await response.json();

  if (!response.ok || data?.status === "error") {
    console.error("MSG91 Email Error:", data);
    throw new Error("MSG91 email send failed");
  }

  return data;
};

module.exports = sendOtpEmail;
