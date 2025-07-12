"use strict";

const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const claimController = require("../controllers/claimController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

// Validation middleware for claim creation and update
const validateClaim = [
  body("patientName")
    .notEmpty()
    .withMessage("Patient name is required")
    .isLength({ max: 255 })
    .withMessage("Patient name must be less than 255 characters"),
  body("admissionDate")
    .notEmpty()
    .withMessage("Admission date is required")
    .isISO8601()
    .withMessage("Invalid admission date format"),
  body("dischargeDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid discharge date format"),
  body("policyNumber")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Policy number must be less than 100 characters"),
  body("hospitalId")
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid hospital ID"),
  body("tpaId")
    .notEmpty()
    .withMessage("TPA ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid TPA ID"),
  body("settlementDetails")
    .optional()
    .isObject()
    .withMessage("Settlement details must be a valid JSON object"),
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

// Validation middleware for claim status update
const validateStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Admitted", "Discharged", "File Submitted", "In Review", "Settled"])
    .withMessage("Invalid status"),
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

// Validation middleware for claim ID
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid claim ID"),
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
 * @route POST /api/v1/claims
 * @desc Create a new claim
 * @access Super Admin, Admin, Staff
 */
router.post(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  uploadMiddleware,
  validateClaim,
  claimController.createClaim
);

/**
 * @route GET /api/v1/claims
 * @desc Get all claims with optional pagination and filtering
 * @access Super Admin, Admin, Staff
 */
router.get(
  "/",
  authorize("Super Admin", "Admin", "Staff"),
  claimController.getAllClaims
);

/**
 * @route GET /api/v1/claims/:id
 * @desc Get a claim by ID
 * @access Super Admin, Admin, Staff
 */
router.get(
  "/:id",
  authorize("Super Admin", "Admin", "Staff"),
  validateId,
  claimController.getClaimById
);

/**
 * @route PUT /api/v1/claims/:id/status
 * @desc Update claim status
 * @access Super Admin, Admin
 */
router.put(
  "/:id/status",
  authorize("Super Admin", "Admin"),
  validateId,
  validateStatus,
  claimController.updateClaimStatus
);

/**
 * @route PUT /api/v1/claims/:id
 * @desc Update claim details
 * @access Super Admin, Admin
 */
router.put(
  "/:id",
  authorize("Super Admin", "Admin"),
  validateId,
  uploadMiddleware,
  validateClaim,
  claimController.updateClaimDetails
);

module.exports = router;
