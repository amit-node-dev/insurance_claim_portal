"use strict";

const { TPA } = require("../models");
const { Op } = require("sequelize");

/**
 * Create a new TPA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTPA = async (req, res) => {
  const { name, address, email } = req.body;

  try {
    // Check if TPA email already exists
    const existingTPA = await TPA.findOne({
      where: { email },
    });

    if (existingTPA) {
      return res.status(409).json({
        success: false,
        message: "TPA email already exists.",
        data: null,
      });
    }

    const tpa = await TPA.create({
      name,
      address,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "TPA created successfully.",
      data: {
        id: tpa.id,
        name: tpa.name,
        address: tpa.address,
        email: tpa.email,
        createdAt: tpa.createdAt,
        updatedAt: tpa.updatedAt,
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
    console.error("Error creating TPA:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create TPA.",
      data: null,
    });
  }
};

/**
 * Get all TPAs with optional pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTPAs = async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const offset = (page - 1) * limit;
    const where = name ? { name: { [Op.like]: `%${name}%` } } : {};

    const { count, rows } = await TPA.findAndCountAll({
      where,
      attributes: ["id", "name", "address", "email", "createdAt", "updatedAt"],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      message: "TPAs retrieved successfully.",
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        tpas: rows,
      },
    });
  } catch (error) {
    console.error("Error retrieving TPAs:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve TPAs.",
      data: null,
    });
  }
};

/**
 * Get a TPA by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTPAById = async (req, res) => {
  const { id } = req.params;

  try {
    const tpa = await TPA.findByPk(id, {
      attributes: ["id", "name", "address", "email", "createdAt", "updatedAt"],
    });

    if (!tpa) {
      return res.status(404).json({
        success: false,
        message: "TPA not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "TPA retrieved successfully.",
      data: tpa,
    });
  } catch (error) {
    console.error("Error retrieving TPA:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve TPA.",
      data: null,
    });
  }
};

/**
 * Update a TPA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTPA = async (req, res) => {
  const { id } = req.params;
  const { name, address, email } = req.body;

  try {
    const tpa = await TPA.findByPk(id);

    if (!tpa) {
      return res.status(404).json({
        success: false,
        message: "TPA not found.",
        data: null,
      });
    }

    // Check for conflicts with other TPAs
    if (email && email !== tpa.email) {
      const existingTPA = await TPA.findOne({
        where: { email, id: { [Op.ne]: id } },
      });

      if (existingTPA) {
        return res.status(409).json({
          success: false,
          message: "TPA email already exists.",
          data: null,
        });
      }
    }

    await tpa.update({
      name: name || tpa.name,
      address: address !== undefined ? address : tpa.address,
      email: email || tpa.email,
    });

    return res.status(200).json({
      success: true,
      message: "TPA updated successfully.",
      data: {
        id: tpa.id,
        name: tpa.name,
        address: tpa.address,
        email: tpa.email,
        createdAt: tpa.createdAt,
        updatedAt: tpa.updatedAt,
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
    console.error("Error updating TPA:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update TPA.",
      data: null,
    });
  }
};

/**
 * Delete a TPA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteTPA = async (req, res) => {
  const { id } = req.params;

  try {
    const tpa = await TPA.findByPk(id);

    if (!tpa) {
      return res.status(404).json({
        success: false,
        message: "TPA not found.",
        data: null,
      });
    }

    // Check if TPA has associated claims
    const associatedClaims = await db.Claim.count({
      where: { tpaId: id },
    });
    if (associatedClaims > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete TPA with ${associatedClaims} associated claim(s).`,
        data: null,
      });
    }

    await tpa.destroy();

    return res.status(200).json({
      success: true,
      message: "TPA deleted successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting TPA:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete TPA.",
      data: null,
    });
  }
};
