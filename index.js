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
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/images", require("./routes/imageRoutes"));
app.use("/api/upload", require("./routes/imageRoutes"));
app.use("/api/image", require("./routes/imageRoutes"));
app.use("/api/experiences", require("./routes/experienceRoutes"));
app.use("/api/experience", require("./routes/experienceRoutes"));
app.use("/api/featured", require("./routes/featuredRoutes"));
app.use("/api/speaker", require("./routes/speakerRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Portfolio Backend Running Successfully...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);