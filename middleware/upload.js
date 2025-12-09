const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// Configure Cloudinary storage for images
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const section = req.query.section || "general";
    return {
      folder: `company/portfolio/${section}`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${section}-${Date.now()}-${file.originalname.split(".")[0]}`,
      quality: "auto",
      fetch_format: "auto",
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
