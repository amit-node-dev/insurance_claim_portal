const express = require("express");
const router = express.Router();
const hospitalController = require("../controllers/hospitalController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Only Super Admin and Admin can create, update, or delete hospitals
router.post(
  "/",
  authorize("Super Admin", "Admin"),
  hospitalController.createHospital
);
router.get(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  hospitalController.getAllHospitals
);
router.get(
  "/:id",
  authorize("Super Admin", "Admin", "Staff"),
  hospitalController.getHospitalById
);
router.put(
  "/:id",
  authorize("Super Admin", "Admin"),
  hospitalController.updateHospital
);
router.delete(
  "/:id",
  authorize("Super Admin", "Admin"),
  hospitalController.deleteHospital
);

module.exports = router;
