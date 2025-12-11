const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
  getAllReviews,
  createReview,
  deleteReview
} = require("../controllers/reviewController");

// PUBLIC ROUTES
router.get("/", getAllReviews);

// ADMIN ROUTES
router.post("/", adminAuth, createReview);
router.delete("/:id", adminAuth, deleteReview);

module.exports = router;