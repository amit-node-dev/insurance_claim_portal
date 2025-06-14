const db = require("../models");
const Claim = db.Claim;

exports.createClaim = async (req, res) => {
  const { patientName, admissionDate, tpaId, hospitalId } = req.body;

  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .send({ message: "At least one document is required." });
  }

  const documentPaths = req.files.map((file) => file.path);

  try {
    const newClaim = await Claim.create({
      patientName,
      admissionDate,
      tpaId,
      hospitalId,
      creatorId: req.userId,
      documents: JSON.stringify(documentPaths), 
    });
    res
      .status(201)
      .send({ message: "Claim created successfully", claimId: newClaim.id });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating claim." });
  }
};
