require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");

const app = express();

// CORS Configuration
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDb();

// Routes
const contactRoutes = require("./routes/contactRoutes");
const imageRoutes = require("./routes/imageRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const featuredRoutes = require("./routes/featuredRoutes");
const speakerRoutes = require("./routes/speakerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/contact", contactRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api", imageRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/featured", featuredRoutes);
app.use("/api/speaker", speakerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/review", reviewRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Portfolio Backend Running Successfully...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);