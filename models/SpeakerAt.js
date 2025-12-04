const mongoose = require("mongoose");

const speakerAtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
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