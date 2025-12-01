require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Brevo = require("@getbrevo/brevo");
const Contact = require("./models/Contact");

const app = express();
app.use(cors());
app.use(express.json());



//  MONGODB CONNECTION
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB Connected"))
    .catch((err) => console.error(" MongoDB Error:", err));



//  ADMIN AUTH MIDDLEWARE

const adminAuth = (req, res, next) => {
    const key = req.headers["x-admin-key"];

    if (!key || key !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
};



//  BREVO EMAIL FUNCTION

const sendMail = async (to, subject, html) => {
    try {
        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.authentications["apiKey"].apiKey =
            process.env.BREVO_API_KEY;

        const sendSmtpEmail = {
            sender: { name: "Portfolio Contact", email: process.env.ADMIN_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        };

        return await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.error(" Brevo Error:", error.message || error);
        throw error;
    }
};



//  CREATE CONTACT + SEND EMAIL (PUBLIC)

app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
        return res
            .status(400)
            .json({ success: false, message: "All fields required" });

    try {
        //  Save to database
        const contact = await Contact.create({ name, email, message });

        //  MAIL TO ADMIN
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

        //  AUTO-REPLY MAIL TO USER
        await sendMail(
            email,
            " We Received Your Message",
            `
        <h3>Hello ${name},</h3>

        <p>Thank you for contacting me. I have received your message and will reply to you shortly.</p>

        <p><b>Your Message:</b></p>
        <blockquote>${message}</blockquote>

        <br/>
        <p>Best Regards,<br/>
        ${process.env.ADMIN_EMAIL}</p>
      `
        );

        //  Final Response
        res.status(201).json({
            success: true,
            message: "Message sent successfully. Confirmation email sent to user.",
            contact,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});




//  GET ALL CONTACTS (ADMIN)

app.get("/api/contacts", adminAuth, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, contacts });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts",
        });
    }
});



//  DELETE SINGLE CONTACT (ADMIN)

app.delete("/api/contact/:id", adminAuth, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Contact deleted" });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Delete failed",
        });
    }
});


// ========================
// ✅ DELETE ALL CONTACTS (ADMIN)
// ========================
app.delete("/api/contacts", adminAuth, async (req, res) => {
    try {
        await Contact.deleteMany();
        res.json({ success: true, message: "All contacts deleted" });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Delete all failed",
        });
    }
});


//  SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`✅ Server running on port ${PORT}`)
);
