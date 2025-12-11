const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminauth");
const {
  getAllExperiences,
  createExperience,
  deleteExperience
} = require("../controllers/experienceController");

// PUBLIC ROUTES
router.get("/", getAllExperiences);

// ADMIN ROUTES
router.post("/", adminAuth, createExperience);
router.delete("/:id", adminAuth, deleteExperience);

module.exports = router;