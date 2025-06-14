const db = require("../models");
const Claim = db.Claim;
const Hospital = db.Hospital;
const TPA = db.TPA;
const { v4: uuidv4 } = require("uuid");

exports.createClaim = async (req, res) => {
  const {
    claimNumber,
    patientName,
    admissionDate,
    policyNumber,
    hospitalId,
    tpaId,
  } = req.body;

  // Validation for required fields
  if (
    !patientName ||
    !admissionDate ||
    !policyNumber ||
    !hospitalId ||
    !tpaId
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Patient name, admission date, policy number, hospital ID, and TPA ID are required.",
      data: null,
    });
  }

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

    // Check for duplicate policyNumber
    const existingClaim = await Claim.findOne({ where: { policyNumber } });
    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "Policy number already exists.",
        data: null,
      });
    }

    // Prepare document paths (optional)
    const documentPaths = req.files ? req.files.map((file) => file.path) : [];

    // Create claim
    const newClaim = await Claim.create({
      claimNumber: claimNumber ? claimNumber : uuidv4(),
      policyNumber,
      patientName,
      admissionDate,
      hospitalId,
      tpaId,
      status: "In Review", 
      creatorId: req.userId,
      documents: documentPaths,
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
        hospitalId: newClaim.hospitalId,
        tpaId: newClaim.tpaId,
        status: newClaim.status,
        creatorId: newClaim.creatorId,
        documents: newClaim.documents,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating claim.",
      data: null,
    });
  }
};
