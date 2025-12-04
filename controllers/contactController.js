const Contact = require("../models/Contact");
const sendMail = require("../utils/brevo");

// CREATE CONTACT
exports.createContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });

  try {
    const contact = await Contact.create({ name, email, message });

    // Admin Mail
    await sendMail(
      process.env.ADMIN_EMAIL,
      "📩 New Portfolio Contact",
      `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    );

    // User Mail
    await sendMail(
      email,
      "✅ We Received Your Message",
      `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting me. I will reply shortly.</p>
        <blockquote>${message}</blockquote>
        <p>Regards,<br/>${process.env.ADMIN_EMAIL}</p>
      `
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL CONTACTS
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
};

// DELETE SINGLE
exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Contact deleted" });
  } catch {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// DELETE ALL
exports.deleteAllContacts = async (req, res) => {
  try {
    await Contact.deleteMany();
    res.json({ success: true, message: "All contacts deleted" });
  } catch {
    res.status(500).json({
      success: false,
      message: "Delete all failed",
    });
  }
};
