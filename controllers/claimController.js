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

exports.updateClaimStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validation
  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required.",
      data: null,
    });
  }

  const validStatuses = [
    "Admitted",
    "Discharged",
    "File Submitted",
    "In Review",
    "Settled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`,
      data: null,
    });
  }

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
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating claim status.",
      data: null,
    });
  }
};

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
    if (hospitalId) {
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
    if (tpaId) {
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

    // Prepare document paths (merge new uploads with existing if any)
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
        updatedAt: claim.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating claim details.",
      data: null,
    });
  }
};
