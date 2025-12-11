const Experience = require("../models/Experience");

// GET ALL EXPERIENCES (PUBLIC)
const getAllExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.json({ success: true, experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch experiences" });
  }
};

// ADD EXPERIENCE (ADMIN)
const createExperience = async (req, res) => {
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
};

// DELETE EXPERIENCE (ADMIN)
const deleteExperience = async (req, res) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Experience deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

module.exports = {
  getAllExperiences,
  createExperience,
  deleteExperience
};