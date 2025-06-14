const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

router.use(verifyToken);

// Matches EPIC 1 User Stories
router.post(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  uploadMiddleware,
  claimController.createClaim
);

// Update claim status (Super Admin and Admin only)
router.put(
  "/:id/status",
  authorize("Super Admin", "Admin"),
  claimController.updateClaimStatus
);

// Update claim details (Super Admin and Admin only, documents optional)
router.put(
  "/:id",
  authorize("Super Admin", "Admin"),
  uploadMiddleware,
  claimController.updateClaimDetails
);

module.exports = router;
