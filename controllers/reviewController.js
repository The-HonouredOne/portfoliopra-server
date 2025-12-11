const Review = require("../models/Review");

// GET ALL REVIEWS (PUBLIC)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// ADD REVIEW (ADMIN)
const createReview = async (req, res) => {
  const { name, position, company, review, rating, avatar } = req.body;
  
  if (!name || !position || !company || !review || !rating) {
    return res.status(400).json({ success: false, message: "All fields except avatar are required" });
  }

  try {
    const newReview = await Review.create({ name, position, company, review, rating, avatar });
    res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};

// DELETE REVIEW (ADMIN)
const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

module.exports = {
  getAllReviews,
  createReview,
  deleteReview
};