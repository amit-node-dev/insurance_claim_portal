"use strict";

const { Op } = require("sequelize");
const { Claim, Hospital, TPA } = require("../models");

/**
 * Get claim status by hospital ID and identifiers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClaimStatus = async (req, res) => {
  const {
    hospitalId,
    claimNumber,
    policyNumber,
    patientName,
    page = 1,
    limit = 10,
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Validate hospital exists
    const hospital = await Hospital.findByPk(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
        data: null,
      });
    }

    // Build where clause
    const whereClause = { hospitalId };
    const identifiers = [];
    if (claimNumber) identifiers.push({ claimNumber });
    if (policyNumber) identifiers.push({ policyNumber });
    if (patientName)
      identifiers.push({ patientName: { [Op.like]: `%${patientName}%` } });

    if (identifiers.length > 0) {
      whereClause[Op.or] = identifiers;
    }

    // Query claims with pagination
    const { count, rows } = await Claim.findAndCountAll({
      where: whereClause,
      attributes: ["claimNumber", "patientName", "status", "updatedAt"],
      include: [
        {
          model: Hospital,
          attributes: ["name"],
          as: "hospital",
        },
        {
          model: TPA,
          attributes: ["name"],
          as: "tpa",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "No claims found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Claims retrieved successfully.",
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        claims: rows.map((claim) => ({
          claimNumber: claim.claimNumber,
          patientName: claim.patientName,
          status: claim.status,
          hospitalName: claim.hospital.name,
          tpaName: claim.tpa ? claim.tpa.name : null,
          lastUpdated: claim.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error retrieving claim status:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve claim status.",
      data: null,
    });
  }
};
