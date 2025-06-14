const express = require("express");
const router = express.Router();
const tpaController = require("../controllers/tpaController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Only Super Admin and Admin can create, update, or delete TPAs
router.post("/", authorize("Super Admin", "Admin"), tpaController.createTPA);
router.get(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  tpaController.getAllTPAs
);
router.get(
  "/:id",
  authorize("Super Admin", "Admin", "Staff"),
  tpaController.getTPAById
);
router.put("/:id", authorize("Super Admin", "Admin"), tpaController.updateTPA);
router.delete(
  "/:id",
  authorize("Super Admin", "Admin"),
  tpaController.deleteTPA
);

module.exports = router;
