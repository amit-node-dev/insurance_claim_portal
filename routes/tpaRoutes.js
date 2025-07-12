"use strict";

const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const tpaController = require("../controllers/tpaController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

// Validation middleware for TPA creation and update
const validateTPA = [
  body("name")
    .notEmpty()
    .withMessage("TPA name is required")
    .isLength({ max: 255 })
    .withMessage("TPA name must be less than 255 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must be less than 500 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: errors.array(),
      });
    }
    next();
  },
];

// Validation middleware for TPA ID
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid TPA ID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: errors.array(),
      });
    }
    next();
  },
];

// Apply authentication middleware to all routes
router.use(verifyToken);

/**
 * @route POST /api/v1/tpas
 * @desc Create a new TPA
 * @access Super Admin, Admin
 */
router.post(
  "/",
  authorize("Super Admin", "Admin"),
  validateTPA,
  tpaController.createTPA
);

/**
 * @route GET /api/v1/tpas
 * @desc Get all TPAs with optional pagination and filtering
 * @access Super Admin, Admin, Staff
 */
router.get(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  tpaController.getAllTPAs
);

/**
 * @route GET /api/v1/tpas/:id
 * @desc Get a TPA by ID
 * @access Super Admin, Admin, Staff
 */
router.get(
  "/:id",
  authorize("Super Admin", "Admin", "Staff"),
  validateId,
  tpaController.getTPAById
);

/**
 * @route PUT /api/v1/tpas/:id
 * @desc Update a TPA
 * @access Super Admin, Admin
 */
router.put(
  "/:id",
  authorize("Super Admin", "Admin"),
  validateId,
  validateTPA,
  tpaController.updateTPA
);

/**
 * @route DELETE /api/v1/tpas/:id
 * @desc Delete a TPA
 * @access Super Admin, Admin
 */
router.delete(
  "/:id",
  authorize("Super Admin", "Admin"),
  validateId,
  tpaController.deleteTPA
);

module.exports = router;
