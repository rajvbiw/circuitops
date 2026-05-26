const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateSession } = require('../middlewares/auth');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);

// Private Routes
router.get('/profile', authenticateSession, authController.getProfile);
router.post('/logout', authenticateSession, authController.logout);

module.exports = router;
