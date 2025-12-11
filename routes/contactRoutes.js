const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminauth");
const {
  createContact,
  getAllContacts,
  deleteContact,
  deleteAllContacts
} = require("../controllers/contactController");

// Handle /api/contact routes
router.post("/", createContact);
router.delete("/:id", adminAuth, deleteContact);

// Handle /api/contacts routes  
router.get("/", adminAuth, getAllContacts);
router.delete("/", adminAuth, deleteAllContacts);

module.exports = router;