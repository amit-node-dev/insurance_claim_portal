"use strict";

const express = require("express");
const router = express.Router();
const { query, validationResult } = require("express-validator");
const publicController = require("../controllers/publicController");

// Validation middleware for claim status query
const validateClaimStatus = [
  query("hospitalId")
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid hospital ID"),
  query("claimNumber")
    .optional()
    .isString()
    .withMessage("Claim number must be a string"),
  query("policyNumber")
    .optional()
    .isString()
    .withMessage("Policy number must be a string")
    .isLength({ max: 100 })
    .withMessage("Policy number must be less than 100 characters"),
  query("patientName")
    .optional()
    .isString()
    .withMessage("Patient name must be a string")
    .isLength({ max: 255 })
    .withMessage("Patient name must be less than 255 characters"),
  query().custom((value, { req }) => {
    if (
      !req.query.claimNumber &&
      !req.query.policyNumber &&
      !req.query.patientName
    ) {
      throw new Error(
        "At least one of claimNumber, policyNumber, or patientName is required"
      );
    }
    return true;
  }),
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

/**
 * @route GET /api/v1/public/claim-status
 * @desc Get claim status by hospital ID and identifiers (claimNumber, policyNumber, or patientName)
 * @access Public
 */
router.get(
  "/claim-status",
  validateClaimStatus,
  publicController.getClaimStatus
);

module.exports = router;
