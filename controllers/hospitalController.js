const db = require("../models");
const Hospital = db.Hospital;
const { Op } = require("sequelize");

// Create a new hospital
exports.createHospital = async (req, res) => {
  const { name, address, email, mobile, reference } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Hospital name is required.",
      data: null,
    });
  }

  try {
    // Check if hospital name or email already exists
    const existingHospital = await Hospital.findOne({
      where: {
        [Op.or]: [{ name: name }, email ? { email } : null].filter(Boolean),
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
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create hospital.",
      data: null,
    });
  }
};

// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      attributes: ["id", "name", "address", "email", "mobile", "reference"], 
    });

    return res.status(200).json({
      success: true,
      message: "Hospitals retrieved successfully.",
      data: hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve hospitals.",
      data: null,
    });
  }
};

// Get hospital by ID
exports.getHospitalById = async (req, res) => {
  const { id } = req.params;

  try {
    const hospital = await Hospital.findByPk(id, {
      attributes: ["id", "name", "address", "email", "mobile", "reference"],
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

// Update a hospital
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
      email: email !== undefined ? email : hospital.email,
      mobile: mobile !== undefined ? mobile : hospital.mobile,
      reference: reference !== undefined ? reference : hospital.reference,
    });

    return res.status(200).json({
      success: true,
      message: "Hospital updated successfully.",
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update hospital.",
      data: null,
    });
  }
};

// Delete a hospital
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

    // Check if hospital has associated claims (assuming Claim model has hospitalId)
    const associatedClaims = await db.Claim.count({
      where: { hospitalId: id },
    });
    if (associatedClaims > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete hospital with associated claims.",
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
