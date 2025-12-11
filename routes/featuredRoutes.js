const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
  getAllFeatured,
  createFeatured,
  deleteFeatured
} = require("../controllers/featuredController");

// PUBLIC ROUTES
router.get("/", getAllFeatured);

// ADMIN ROUTES
router.post("/", adminAuth, createFeatured);
router.delete("/:id", adminAuth, deleteFeatured);

module.exports = router;