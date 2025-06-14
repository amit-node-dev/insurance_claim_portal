const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// A single route for both login and registration
router.post('/login', authController.loginOrRegister);

module.exports = router;