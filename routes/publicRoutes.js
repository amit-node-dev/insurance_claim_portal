const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Matches R1: Public Claim Status Search
router.get('/claim-status', publicController.getClaimStatus);

module.exports = router;