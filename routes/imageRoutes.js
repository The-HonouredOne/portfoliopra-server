const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");
const {
  uploadImage,
  getAllImages,
  deleteImage
} = require("../controllers/imageController");

// PUBLIC ROUTES
router.get("/", getAllImages);

// ADMIN ROUTES
router.post("/upload", adminAuth, upload.single("image"), uploadImage);
router.delete("/:publicId", adminAuth, deleteImage);

module.exports = router;