"use strict";

const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const hospitalController = require("../controllers/hospitalController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

// Validation middleware for hospital creation and update
const validateHospital = [
  body("name")
    .notEmpty()
    .withMessage("Hospital name is required")
    .isLength({ max: 255 })
    .withMessage("Hospital name must be less than 255 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must be less than 500 characters"),
  body("mobile")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Mobile number must be less than 20 characters"),
  body("reference")
    .optional()
    .isObject()
    .withMessage("Reference must be a valid JSON object"),
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

// Validation middleware for hospital ID
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid hospital ID"),
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
 * @route POST /api/v1/hospitals
 * @desc Create a new hospital
 * @access Super Admin, Admin
 */
router.post(
  "/",
  authorize("Super Admin", "Admin"),
  validateHospital,
  hospitalController.createHospital
);

/**
 * @route GET /api/v1/hospitals
 * @desc Get all hospitals with optional pagination and filtering
 * @access Super Admin, Admin, Staff
 */
router.get(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  hospitalController.getAllHospitals
);

/**
 * @route GET /api/v1/hospitals/:id
 * @desc Get a hospital by ID
 * @access Super Admin, Admin, Staff
 */
router.get(
  "/:id",
  authorize("Super Admin", "Admin", "Staff"),
  validateId,
  hospitalController.getHospitalById
);

/**
 * @route PUT /api/v1/hospitals/:id
 * @desc Update a hospital
 * @access Super Admin, Admin
 */
router.put(
  "/:id",
  authorize("Super Admin", "Admin"),
  validateId,
  validateHospital,
  hospitalController.updateHospital
);

/**
 * @route DELETE /api/v1/hospitals/:id
 * @desc Delete a hospital
 * @access Super Admin, Admin
 */
router.delete(
  "/:id",
  authorize("Super Admin", "Admin"),
  validateId,
  hospitalController.deleteHospital
);

module.exports = router;
