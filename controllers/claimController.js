"use strict";

const { Hospital, TPA, Claim } = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

/**
 * Create a new claim
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createClaim = async (req, res) => {
  const {
    claimNumber,
    patientName,
    admissionDate,
    dischargeDate,
    policyNumber,
    hospitalId,
    tpaId,
    settlementDetails,
  } = req.body;

  console.log("Claim creation request body:", req.body);

  try {
    // Validate hospitalId
    const hospital = await Hospital.findByPk(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
        data: null,
      });
    }

    // Validate tpaId
    const tpa = await TPA.findByPk(tpaId);
    if (!tpa) {
      return res.status(404).json({
        success: false,
        message: "TPA not found.",
        data: null,
      });
    }

    // Check for duplicate claimNumber if provided
    const generatedClaimNumber = claimNumber || `CLM-${uuidv4().slice(0, 8)}`;
    const existingClaimByNumber = await Claim.findOne({
      where: { claimNumber: generatedClaimNumber },
    });
    if (existingClaimByNumber) {
      return res.status(409).json({
        success: false,
        message: "Claim number already exists.",
        data: null,
      });
    }

    // Check for duplicate policyNumber if provided
    if (policyNumber) {
      const existingClaimPolicyNumber = await Claim.findOne({ where: { policyNumber } });
      if (existingClaimPolicyNumber) {
        return res.status(409).json({
          success: false,
          message: "Policy number already exists.",
          data: null,
        });
      }
    }

    // Prepare document paths
    const documentPaths = req.files ? req.files.map((file) => file.path) : [];

    // Create claim
    const newClaim = await Claim.create({
      claimNumber: generatedClaimNumber,
      policyNumber,
      patientName,
      admissionDate,
      dischargeDate,
      hospitalId,
      tpaId,
      creatorId: req.userId,
      status: "Admitted", 
      documents: documentPaths,
      settlementDetails,
    });

    return res.status(201).json({
      success: true,
      message: "Claim created successfully.",
      data: {
        id: newClaim.id,
        claimNumber: newClaim.claimNumber,
        policyNumber: newClaim.policyNumber,
        patientName: newClaim.patientName,
        admissionDate: newClaim.admissionDate,
        dischargeDate: newClaim.dischargeDate,
        hospitalId: newClaim.hospitalId,
        tpaId: newClaim.tpaId,
        status: newClaim.status,
        creatorId: newClaim.creatorId,
        documents: newClaim.documents,
        settlementDetails: newClaim.settlementDetails,
        createdAt: newClaim.createdAt,
        updatedAt: newClaim.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", "),
        data: null,
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: `Claim with ${error.errors[0].path} already exists.`,
        data: null,
      });
    }
    console.error("Error creating claim:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create claim.",
      data: null,
    });
  }
};

/**
 * Get all claims with optional pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllClaims = async (req, res) => {
  try {
    const { page = 1, limit = 10, patientName, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (patientName) where.patientName = { [Op.like]: `%${patientName}%` };
    if (status) where.status = status;

    const { count, rows } = await Claim.findAndCountAll({
      where,
      attributes: [
        "id",
        "claimNumber",
        "policyNumber",
        "patientName",
        "admissionDate",
        "dischargeDate",
        "hospitalId",
        "tpaId",
        "status",
        "creatorId",
        "documents",
        "settlementDetails",
        "createdAt",
        "updatedAt",
      ],
      include: [
        { model: Hospital, attributes: ["id", "name"], as: "hospital" },
        { model: TPA, attributes: ["id", "name"], as: "tpa" },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      message: "Claims retrieved successfully.",
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        claims: rows,
      },
    });
  } catch (error) {
    console.error("Error retrieving claims:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve claims.",
      data: null,
    });
  }
};

/**
 * Get a claim by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClaimById = async (req, res) => {
  const { id } = req.params;

  try {
    const claim = await Claim.findByPk(id, {
      attributes: [
        "id",
        "claimNumber",
        "policyNumber",
        "patientName",
        "admissionDate",
        "dischargeDate",
        "hospitalId",
        "tpaId",
        "status",
        "creatorId",
        "documents",
        "settlementDetails",
        "createdAt",
        "updatedAt",
      ],
      include: [
        { model: Hospital, attributes: ["id", "name"], as: "hospital" },
        { model: TPA, attributes: ["id", "name"], as: "tpa" },
      ],
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Claim retrieved successfully.",
      data: claim,
    });
  } catch (error) {
    console.error("Error retrieving claim:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve claim.",
      data: null,
    });
  }
};

/**
 * Update claim status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateClaimStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const claim = await Claim.findByPk(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
        data: null,
      });
    }

    await claim.update({ status });

    return res.status(200).json({
      success: true,
      message: "Claim status updated successfully.",
      data: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        patientName: claim.patientName,
        status: claim.status,
        updatedAt: claim.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", "),
        data: null,
      });
    }
    console.error("Error updating claim status:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update claim status.",
      data: null,
    });
  }
};

/**
 * Update claim details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateClaimDetails = async (req, res) => {
  const { id } = req.params;
  const {
    patientName,
    admissionDate,
    dischargeDate,
    policyNumber,
    hospitalId,
    tpaId,
    settlementDetails,
  } = req.body;

  try {
    const claim = await Claim.findByPk(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
        data: null,
      });
    }

    // Validate hospitalId if provided
    if (hospitalId && hospitalId !== claim.hospitalId) {
      const hospital = await Hospital.findByPk(hospitalId);
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found.",
          data: null,
        });
      }
    }

    // Validate tpaId if provided
    if (tpaId && tpaId !== claim.tpaId) {
      const tpa = await TPA.findByPk(tpaId);
      if (!tpa) {
        return res.status(404).json({
          success: false,
          message: "TPA not found.",
          data: null,
        });
      }
    }

    // Check for duplicate policyNumber if provided
    if (policyNumber && policyNumber !== claim.policyNumber) {
      const existingClaim = await Claim.findOne({
        where: { policyNumber, id: { [Op.ne]: id } },
      });
      if (existingClaim) {
        return res.status(409).json({
          success: false,
          message: "Policy number already exists.",
          data: null,
        });
      }
    }

    // Prepare document paths (merge new uploads with existing)
    let documentPaths = claim.documents || [];
    if (req.files && req.files.length > 0) {
      const newDocumentPaths = req.files.map((file) => file.path);
      documentPaths = [...documentPaths, ...newDocumentPaths];
    }

    // Update claim
    await claim.update({
      patientName: patientName || claim.patientName,
      admissionDate: admissionDate || claim.admissionDate,
      dischargeDate:
        dischargeDate !== undefined ? dischargeDate : claim.dischargeDate,
      policyNumber: policyNumber || claim.policyNumber,
      hospitalId: hospitalId || claim.hospitalId,
      tpaId: tpaId || claim.tpaId,
      settlementDetails:
        settlementDetails !== undefined
          ? settlementDetails
          : claim.settlementDetails,
      documents: documentPaths,
    });

    return res.status(200).json({
      success: true,
      message: "Claim details updated successfully.",
      data: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        policyNumber: claim.policyNumber,
        patientName: claim.patientName,
        admissionDate: claim.admissionDate,
        dischargeDate: claim.dischargeDate,
        hospitalId: claim.hospitalId,
        tpaId: claim.tpaId,
        status: claim.status,
        creatorId: claim.creatorId,
        documents: claim.documents,
        settlementDetails: claim.settlementDetails,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", "),
        data: null,
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: `Claim with ${error.errors[0].path} already exists.`,
        data: null,
      });
    }
    console.error("Error updating claim details:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update claim details.",
      data: null,
    });
  }
};
