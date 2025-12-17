const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

/**
 * @route   GET /api/cart
 * @desc    Get cart user
 * @access  Private
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Add item ke cart
 * @access  Private
 */
router.post('/', cartController.addToCart);

/**
 * @route   PUT /api/cart/:itemId
 * @desc    Update quantity item di cart
 * @access  Private
 */
router.put('/:itemId', cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    Remove item dari cart
 * @access  Private
 */
router.delete('/:itemId', cartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear semua item di cart
 * @access  Private
 */
router.delete('/', cartController.clearCart);

module.exports = router;
