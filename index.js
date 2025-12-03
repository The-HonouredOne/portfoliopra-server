require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Brevo = require("@getbrevo/brevo");

const Contact = require("./models/Contact");
const upload = require("./middleware/upload");
const cloudinary = require("./utils/cloudinary");

const app = express();

// ========================
// ✅ CORS + BODY PARSER
// ========================
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://portfoliopra-server.onrender.com",
    "https://portfoliopraveensir.vercel.app"
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-key"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// ✅ MONGODB CONNECTION
// ========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ========================
// ✅ ADMIN AUTH MIDDLEWARE
// ========================
const adminAuth = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

// ========================
// ✅ BREVO EMAIL FUNCTION
// ========================
const sendMail = async (to, subject, html) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications["apiKey"].apiKey =
      process.env.BREVO_API_KEY;

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

// ========================
// ✅ CONTACT FORM (PUBLIC)
// ========================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });

  try {
    // ✅ Save to DB
    const contact = await Contact.create({ name, email, message });

    // ✅ Mail to Admin
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

    // ✅ Auto Reply to User
    await sendMail(
      email,
      "✅ We Received Your Message",
      `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting me. I have received your message and will reply shortly.</p>
        <p><b>Your Message:</b></p>
        <blockquote>${message}</blockquote>
        <br/>
        <p>Best Regards,<br/>${process.env.ADMIN_EMAIL}</p>
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
});

// ========================
// ✅ GET ALL CONTACTS (ADMIN)
// ========================
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

// ========================
// ✅ DELETE SINGLE CONTACT (ADMIN)
// ========================
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


// ========================
// ✅ IMAGE UPLOAD (ADMIN)
// ========================
app.post("/api/upload", adminAuth, upload.single("image"), (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Image uploaded",
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});

// ========================
// ✅ GET ALL IMAGES FROM CLOUDINARY
// ========================
app.get("/api/images", async (req, res) => {
  try {
    const folder = req.query.folder || "company/portfolio";
    const max = Number(req.query.max) || 50;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: max,
      direction: "desc",
    });

    const images = result.resources.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
      format: img.format,
      width: img.width,
      height: img.height,
      created_at: img.created_at,
    }));

    res.json({
      success: true,
      total: images.length,
      images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
});

// ========================
// ✅ DELETE IMAGE FROM CLOUDINARY (ADMIN)
// ========================
app.delete("/api/image/:publicId", adminAuth, async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json({
      success: true,
      message: "Image deleted",
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Image delete failed",
    });
  }
});

// ========================
// ✅ TEST ROUTE
// ========================
app.get("/", (req, res) => {
  res.send("✅ Portfolio Backend Running Successfully...");
});

// ========================
// ✅ SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
