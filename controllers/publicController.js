const { Op } = require('sequelize');
const db = require('../models');
const Claim = db.Claim;
const Hospital = db.Hospital;

exports.getClaimStatus = async (req, res) => {
    const { hospitalId, claimNumber, policyNumber, patientName } = req.query;

    if (!hospitalId || (!claimNumber && !policyNumber && !patientName)) {
        return res.status(400).send({ message: "Hospital and at least one identifier are required." });
    }

    try {
        const whereClause = { hospitalId };
        const identifiers = [];

        if (claimNumber) identifiers.push({ claimNumber: claimNumber });
        if (policyNumber) identifiers.push({ policyNumber: policyNumber });
        if (patientName) identifiers.push({ patientName: { [Op.like]: `%${patientName}%` } });

        whereClause[Op.or] = identifiers;

        const claim = await Claim.findOne({
            where: whereClause,
            attributes: ['status', 'updatedAt'] // Only send necessary data
        });

        if (!claim) {
            return res.status(404).send({ message: "No Record Found" });
        }

        res.status(200).send({
            status: claim.status,
            lastUpdated: claim.updatedAt,
        });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error retrieving claim status." });
    }
};