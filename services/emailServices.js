const https = require("https");

module.exports = function sendOtpEmail(name, email, otp) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      recipients: [
        {
          to: [
            {
              name: name,
              email: email,
            },
          ],
          variables: {
            VAR1: name,        // Hello {{VAR1}}
            VAR2: otp,          // {{VAR2}}
            VAR3: 10,           // {{VAR3}} minutes
          },
        },
      ],
      from: {
        name: "My Diabetes Wellness",
        email: "info@mydiabeteswellness.health",
      },
      domain: "mail.mydiabeteswellness.health",
      template_id: "mdw_login_", // ✅ approved template ID
    });

    const options = {
      hostname: "control.msg91.com",
      path: "/api/v5/email/send",
      method: "POST",
      headers: {
        accept: "application/json",
        authkey: process.env.MSG91_AUTHKEY,
        "content-type": "application/json",
        "content-length": Buffer.byteLength(payload),
      },
      timeout: 8000, // 🔥 prevents hanging
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => (body += chunk));

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(
            new Error(`MSG91 error ${res.statusCode}: ${body}`)
          );
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("MSG91 request timeout"));
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};
