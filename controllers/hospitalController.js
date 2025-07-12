"use strict";

const { Hospital } = require("../models");
const { Op } = require("sequelize");

/**
 * Create a new hospital
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createHospital = async (req, res) => {
  const { name, address, email, mobile, reference } = req.body;

  try {
    // Check if hospital email already exists
    const existingHospital = await Hospital.findOne({
      where: { email },
    });

    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: "Hospital email already exists.",
        data: null,
      });
    }

    const hospital = await Hospital.create({
      name,
      address,
      email,
      mobile,
      reference,
    });

    return res.status(201).json({
      success: true,
      message: "Hospital created successfully.",
      data: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        email: hospital.email,
        mobile: hospital.mobile,
        reference: hospital.reference,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: `Hospital with ${error.errors[0].path} already exists.`,
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create hospital.",
      data: null,
    });
  }
};

/**
 * Get all hospitals with optional pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const offset = (page - 1) * limit;
    const where = name ? { name: { [Op.like]: `%${name}%` } } : {};

    const { count, rows } = await Hospital.findAndCountAll({
      where,
      attributes: [
        "id",
        "name",
        "address",
        "email",
        "mobile",
        "reference",
        "createdAt",
        "updatedAt",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      message: "Hospitals retrieved successfully.",
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        hospitals: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve hospitals.",
      data: null,
    });
  }
};

/**
 * Get a hospital by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHospitalById = async (req, res) => {
  const { id } = req.params;

  try {
    const hospital = await Hospital.findByPk(id, {
      attributes: [
        "id",
        "name",
        "address",
        "email",
        "mobile",
        "reference",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital retrieved successfully.",
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve hospital.",
      data: null,
    });
  }
};

/**
 * Update a hospital
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateHospital = async (req, res) => {
  const { id } = req.params;
  const { name, address, email, mobile, reference } = req.body;

  try {
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
        data: null,
      });
    }

    // Check for conflicts with other hospitals
    if (name || email) {
      const existingHospital = await Hospital.findOne({
        where: {
          [Op.or]: [
            name && name !== hospital.name ? { name } : null,
            email && email !== hospital.email ? { email } : null,
          ].filter(Boolean),
          id: { [Op.ne]: id },
        },
      });

      if (existingHospital) {
        return res.status(409).json({
          success: false,
          message:
            existingHospital.name === name
              ? "Hospital name already exists."
              : "Hospital email already exists.",
          data: null,
        });
      }
    }

    await hospital.update({
      name: name || hospital.name,
      address: address !== undefined ? address : hospital.address,
      email: email || hospital.email,
      mobile: mobile !== undefined ? mobile : hospital.mobile,
      reference: reference !== undefined ? reference : hospital.reference,
    });

    return res.status(200).json({
      success: true,
      message: "Hospital updated successfully.",
      data: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        email: hospital.email,
        mobile: hospital.mobile,
        reference: hospital.reference,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: `Hospital with ${error.errors[0].path} already exists.`,
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update hospital.",
      data: null,
    });
  }
};

/**
 * Delete a hospital
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteHospital = async (req, res) => {
  const { id } = req.params;

  try {
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
        data: null,
      });
    }

    // Check if hospital has associated claims
    const associatedClaims = await db.Claim.count({
      where: { hospitalId: id },
    });
    if (associatedClaims > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hospital with ${associatedClaims} associated claim(s).`,
        data: null,
      });
    }

    await hospital.destroy();

    return res.status(200).json({
      success: true,
      message: "Hospital deleted successfully.",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete hospital.",
      data: null,
    });
  }
};
