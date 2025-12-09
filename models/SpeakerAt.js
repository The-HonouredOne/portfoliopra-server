const mongoose = require("mongoose");

const speakerAtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  speakerImages: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one image is required']
  },
  topic: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("SpeakerAt", speakerAtSchema);