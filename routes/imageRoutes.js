const express = require("express");
const router = express.Router();

const {
  uploadImage,
  getImages,
  deleteImage,
} = require("../controllers/imageController");

const upload = require("../middleware/upload");
const adminAuth = require("../middleware/adminauth");

router.post("/upload", adminAuth, upload.single("image"), uploadImage);
router.get("/images", getImages);
router.delete("/image/:publicId", adminAuth, deleteImage);

module.exports = router;
