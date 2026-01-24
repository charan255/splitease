const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/verify
router.post('/verify', authController.verifyOTP);

module.exports = router;
