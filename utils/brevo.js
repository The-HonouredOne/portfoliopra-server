const Brevo = require("@getbrevo/brevo");

const sendMail = async (to, subject, html) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = {
      sender: {
        name: "Portfolio Contact",
        email: process.env.ADMIN_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("❌ Brevo Error:", error.message || error);
    throw error;
  }
};

module.exports = { sendMail };