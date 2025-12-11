const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminauth");
const upload = require("../middleware/upload");
const {
  uploadImage,
  getAllImages,
  deleteImage
} = require("../controllers/imageController");

// PUBLIC ROUTES
router.get("/images", getAllImages);

// ADMIN ROUTES
router.post("/upload", adminAuth, upload.single("image"), uploadImage);
router.delete("/image/:publicId", adminAuth, deleteImage);

module.exports = router;