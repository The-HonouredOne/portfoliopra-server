const cloudinary = require("../utils/cloudinary");

// UPLOAD IMAGE
exports.uploadImage = (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Image uploaded",
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

// GET IMAGES
exports.getImages = async (req, res) => {
  try {
    const folder = req.query.folder || "company/portfolio";
    const max = Number(req.query.max) || 50;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: max,
      direction: "desc",
    });

    const images = result.resources.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
      format: img.format,
      width: img.width,
      height: img.height,
      created_at: img.created_at,
    }));

    res.json({
      success: true,
      total: images.length,
      images,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
};

// DELETE IMAGE
exports.deleteImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json({
      success: true,
      message: "Image deleted",
      result,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Image delete failed",
    });
  }
};
