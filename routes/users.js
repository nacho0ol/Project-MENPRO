const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile
 * @access  Private
 */
router.get('/:id', usersController.getUserProfile);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.put('/:id', usersController.updateUserProfile);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/:id/password', usersController.changePassword);

/**
 * @route   GET /api/users (admin only)
 * @desc    Get semua users
 * @access  Private/Admin
 */
router.get('/', usersController.getAllUsers);

/**
 * @route   DELETE /api/users/:id (admin only)
 * @desc    Delete user account
 * @access  Private/Admin
 */
router.delete('/:id', usersController.deleteUser);

module.exports = router;
