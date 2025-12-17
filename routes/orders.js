const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

/**
 * @route   POST /api/orders
 * @desc    Create order baru
 * @access  Private
 */
router.post('/', ordersController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get semua order user
 * @access  Private
 */
router.get('/', ordersController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get detail order berdasarkan ID
 * @access  Private
 */
router.get('/:id', ordersController.getOrderById);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update status order (admin only)
 * @access  Private/Admin
 */
router.put('/:id', ordersController.updateOrder);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel order
 * @access  Private
 */
router.delete('/:id', ordersController.cancelOrder);

module.exports = router;
