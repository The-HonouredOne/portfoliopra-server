const FeaturedIn = require("../models/FeaturedIn");

// GET ALL FEATURED IN (PUBLIC)
const getAllFeatured = async (req, res) => {
  try {
    const featured = await FeaturedIn.find().sort({ createdAt: -1 });
    res.json({ success: true, featured });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch featured" });
  }
};

// ADD FEATURED IN (ADMIN)
const createFeatured = async (req, res) => {
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
};

// DELETE FEATURED IN (ADMIN)
const deleteFeatured = async (req, res) => {
  try {
    await FeaturedIn.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Featured deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

module.exports = {
  getAllFeatured,
  createFeatured,
  deleteFeatured
};