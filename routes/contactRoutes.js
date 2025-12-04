const express = require("express");
const router = express.Router();

const {
  createContact,
  getContacts,
  deleteContact,
  deleteAllContacts,
} = require("../controllers/contactController");

const adminAuth = require("../middleware/adminauth");

router.post("/contact", createContact);
router.get("/contacts", adminAuth, getContacts);
router.delete("/contact/:id", adminAuth, deleteContact);
router.delete("/contacts", adminAuth, deleteAllContacts);

module.exports = router;
