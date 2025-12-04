const mongoose = require("mongoose");

const featuredInSchema = new mongoose.Schema({
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

module.exports = mongoose.model("FeaturedIn", featuredInSchema);