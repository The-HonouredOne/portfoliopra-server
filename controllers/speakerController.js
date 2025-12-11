const SpeakerAt = require("../models/SpeakerAt");

// GET ALL SPEAKER AT (PUBLIC)
const getAllSpeakers = async (req, res) => {
  try {
    const speaker = await SpeakerAt.find().sort({ createdAt: -1 });
    res.json({ success: true, speaker });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch speaker" });
  }
};

// ADD SPEAKER AT (ADMIN)
const createSpeaker = async (req, res) => {
  const { name, speakerImages, topic, url } = req.body;
  
  if (!name || !speakerImages || !Array.isArray(speakerImages) || speakerImages.length === 0 || !topic) {
    return res.status(400).json({ success: false, message: "Name, at least one speaker image and topic are required" });
  }

  try {
    const speaker = await SpeakerAt.create({ name, speakerImages, topic, url });
    res.status(201).json({ success: true, speaker });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add speaker" });
  }
};

// DELETE SPEAKER AT (ADMIN)
const deleteSpeaker = async (req, res) => {
  try {
    await SpeakerAt.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Speaker deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

module.exports = {
  getAllSpeakers,
  createSpeaker,
  deleteSpeaker
};