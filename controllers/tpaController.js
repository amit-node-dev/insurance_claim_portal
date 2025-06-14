const db = require("../models");
const TPA = db.TPA;
const { Op } = require("sequelize");

// Create a new TPA
exports.createTPA = async (req, res) => {
  const { name, address, email } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "TPA name is required.",
      data: null,
    });
  }

  try {
    // Check if TPA name or email already exists
    const existingTPA = await TPA.findOne({
      where: {
        [Op.or]: [{ name }, email ? { email } : null].filter(Boolean),
      },
    });

    if (existingTPA) {
      return res.status(409).json({
        success: false,
        message:
          existingTPA.name === name
            ? "TPA name already exists."
            : "TPA email already exists.",
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
      data: tpa,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create TPA.",
      data: null,
    });
  }
};

// Get all TPAs
exports.getAllTPAs = async (req, res) => {
  try {
    const tpas = await TPA.findAll({
      attributes: ["id", "name", "address", "email"],
    });

    return res.status(200).json({
      success: true,
      message: "TPAs retrieved successfully.",
      data: tpas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve TPAs.",
      data: null,
    });
  }
};

// Get TPA by ID
exports.getTPAById = async (req, res) => {
  const { id } = req.params;

  try {
    const tpa = await TPA.findByPk(id, {
      attributes: ["id", "name", "address", "email"],
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
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve TPA.",
      data: null,
    });
  }
};

// Update a TPA
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
    if (name || email) {
      const existingTPA = await TPA.findOne({
        where: {
          [Op.or]: [
            name && name !== tpa.name ? { name } : null,
            email && email !== tpa.email ? { email } : null,
          ].filter(Boolean),
          id: { [Op.ne]: id },
        },
      });

      if (existingTPA) {
        return res.status(409).json({
          success: false,
          message:
            existingTPA.name === name
              ? "TPA name already exists."
              : "TPA email already exists.",
          data: null,
        });
      }
    }

    await tpa.update({
      name: name || tpa.name,
      address: address !== undefined ? address : tpa.address,
      email: email !== undefined ? email : tpa.email,
    });

    return res.status(200).json({
      success: true,
      message: "TPA updated successfully.",
      data: tpa,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update TPA.",
      data: null,
    });
  }
};

// Delete a TPA
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
    const associatedClaims = await db.Claim.count({ where: { tpaId: id } });
    if (associatedClaims > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete TPA with associated claims.",
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
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete TPA.",
      data: null,
    });
  }
};
