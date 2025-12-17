const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateInput } = require('../middlewares/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register user baru
 * @access  Public
 */
router.post('/register', validateInput, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateInput, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get profile user yang login
 * @access  Private
 */
router.get('/profile', authController.getProfile);

module.exports = router;
