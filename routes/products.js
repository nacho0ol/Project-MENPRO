const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

/**
 * @route   GET /api/products
 * @desc    Get semua produk
 * @access  Public
 */
router.get('/', productsController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get detail produk berdasarkan ID
 * @access  Public
 */
router.get('/:id', productsController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create produk baru (admin only)
 * @access  Private/Admin
 */
router.post('/', productsController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update produk (admin only)
 * @access  Private/Admin
 */
router.put('/:id', productsController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete produk (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
