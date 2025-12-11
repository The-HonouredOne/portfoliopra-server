const Image = require("../models/Image");
const cloudinary = require("../utils/cloudinary");

// UPLOAD IMAGE (ADMIN)
const uploadImage = async (req, res) => {
  try {
    const { caption } = req.body;
    const section = req.query.section || "general";
    
    if (section === "general" && caption) {
      await Image.create({
        url: req.file.path,
        publicId: req.file.filename,
        caption
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Image uploaded",
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

// GET ALL IMAGES FROM DATABASE
const getAllImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      total: images.length,
      images: images.map(img => ({
        public_id: img.publicId,
        url: img.url,
        caption: img.caption,
        created_at: img.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
};

// DELETE IMAGE FROM CLOUDINARY AND DATABASE (ADMIN)
const deleteImage = async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    await Image.findOneAndDelete({ publicId: req.params.publicId });
    
    res.json({
      success: true,
      message: "Image deleted"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Image delete failed",
    });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
  deleteImage
};