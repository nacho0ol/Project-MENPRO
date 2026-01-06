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
 * @route   GET /api/users/:id/addresses
 * @desc    Get all addresses for user
 * @access  Private
 */
router.get('/:id/addresses', usersController.getUserAddresses);

/**
 * @route   GET /api/users/:id/addresses/:addrId
 * @desc    Get specific address
 * @access  Private
 */
router.get('/:id/addresses/:addrId', usersController.getAddressById);

/**
 * @route   POST /api/users/:id/addresses
 * @desc    Create new address
 * @access  Private
 */
router.post('/:id/addresses', usersController.createAddress);

/**
 * @route   PUT /api/users/:id/addresses/:addrId
 * @desc    Update address
 * @access  Private
 */
router.put('/:id/addresses/:addrId', usersController.updateAddress);

/**
 * @route   DELETE /api/users/:id/addresses/:addrId
 * @desc    Delete address
 * @access  Private
 */
router.delete('/:id/addresses/:addrId', usersController.deleteAddress);

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
