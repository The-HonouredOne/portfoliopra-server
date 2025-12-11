const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
  getAllSpeakers,
  createSpeaker,
  deleteSpeaker
} = require("../controllers/speakerController");

// PUBLIC ROUTES
router.get("/", getAllSpeakers);

// ADMIN ROUTES
router.post("/", adminAuth, createSpeaker);
router.delete("/:id", adminAuth, deleteSpeaker);

module.exports = router;