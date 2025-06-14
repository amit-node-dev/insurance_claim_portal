const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

router.use(verifyToken);

// Matches EPIC 1 User Stories
router.post(
  "/",
  authorize("Admin", "Staff"),
  uploadMiddleware,
  claimController.createClaim
);

module.exports = router;
