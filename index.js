require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Brevo = require("@getbrevo/brevo");

const Contact = require("./models/Contact");
const Experience = require("./models/Experience");
const FeaturedIn = require("./models/FeaturedIn");
const SpeakerAt = require("./models/SpeakerAt");
const upload = require("./middleware/upload");
const cloudinary = require("./utils/cloudinary");
const connectDb = require("./config/db");

const app = express();


app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://portfoliopraveensir.vercel.app"
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-key"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDb()

//  ADMIN AUTH MIDDLEWARE
const adminAuth = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
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

//  CONTACT FORM (PUBLIC)

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });

  try {
    
    const contact = await Contact.create({ name, email, message });

   
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

//  DELETE ALL CONTACTS (ADMIN)

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


// IMAGE UPLOAD (ADMIN)
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

//  GET ALL IMAGES FROM CLOUDINARY

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

//  DELETE IMAGE FROM CLOUDINARY (ADMIN)
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

// EXPERIENCE ROUTES
// GET ALL EXPERIENCES (PUBLIC)
app.get("/api/experiences", async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.json({ success: true, experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch experiences" });
  }
});

// ADD EXPERIENCE (ADMIN)
app.post("/api/experience", adminAuth, async (req, res) => {
  const { company, position, duration, description, technologies } = req.body;
  
  if (!company || !position || !duration || !description) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const experience = await Experience.create({ company, position, duration, description, technologies });
    res.status(201).json({ success: true, experience });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add experience" });
  }
});

// DELETE EXPERIENCE (ADMIN)
app.delete("/api/experience/:id", adminAuth, async (req, res) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Experience deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// FEATURED IN ROUTES
// GET ALL FEATURED IN (PUBLIC)
app.get("/api/featured", async (req, res) => {
  try {
    const featured = await FeaturedIn.find().sort({ createdAt: -1 });
    res.json({ success: true, featured });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch featured" });
  }
});

// ADD FEATURED IN (ADMIN)
app.post("/api/featured", adminAuth, async (req, res) => {
  const { name, logo, url } = req.body;
  
  if (!name || !logo) {
    return res.status(400).json({ success: false, message: "Name and logo are required" });
  }

  try {
    const featured = await FeaturedIn.create({ name, logo, url });
    res.status(201).json({ success: true, featured });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add featured" });
  }
});

// DELETE FEATURED IN (ADMIN)
app.delete("/api/featured/:id", adminAuth, async (req, res) => {
  try {
    await FeaturedIn.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Featured deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// SPEAKER AT ROUTES
// GET ALL SPEAKER AT (PUBLIC)
app.get("/api/speaker", async (req, res) => {
  try {
    const speaker = await SpeakerAt.find().sort({ createdAt: -1 });
    res.json({ success: true, speaker });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch speaker" });
  }
});

// ADD SPEAKER AT (ADMIN)
app.post("/api/speaker", adminAuth, async (req, res) => {
  const { name, logo, url } = req.body;
  
  if (!name || !logo) {
    return res.status(400).json({ success: false, message: "Name and logo are required" });
  }

  try {
    const speaker = await SpeakerAt.create({ name, logo, url });
    res.status(201).json({ success: true, speaker });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add speaker" });
  }
});

// DELETE SPEAKER AT (ADMIN)
app.delete("/api/speaker/:id", adminAuth, async (req, res) => {
  try {
    await SpeakerAt.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Speaker deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("✅ Portfolio Backend Running Successfully...");
});

//  SERVER

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
