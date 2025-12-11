const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
  createContact,
  getAllContacts,
  deleteContact,
  deleteAllContacts
} = require("../controllers/contactController");

// PUBLIC ROUTES
router.post("/", createContact);

// ADMIN ROUTES
router.get("/", adminAuth, getAllContacts);
router.delete("/all", adminAuth, deleteAllContacts);
router.delete("/:id", adminAuth, deleteContact);

module.exports = router;