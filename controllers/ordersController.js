const db = require('../config/database');

/**
 * Create order baru
 */
exports.createOrder = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { shipping_address, payment_method } = req.body;

        if (!userId || !shipping_address) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID dan shipping address wajib diisi' 
            });
        }

        // Get cart user
        const [cartItems] = await db.query(
            'SELECT * FROM cart WHERE user_id = ?',
            [userId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart kosong' 
            });
        }

        // Hitung total
        let total = 0;
        for (let item of cartItems) {
            const [products] = await db.query(
                'SELECT price FROM products WHERE id = ?',
                [item.product_id]
            );
            if (products.length > 0) {
                total += products[0].price * item.quantity;
            }
        }

        // Create order
        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, "pending")',
            [userId, total, shipping_address, payment_method || 'cash']
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (let item of cartItems) {
            const [products] = await db.query(
                'SELECT price FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length > 0) {
                await db.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, products[0].price]
                );
            }
        }

        // Clear cart
        await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        res.status(201).json({
            success: true,
            message: 'Order berhasil dibuat',
            data: {
                order_id: orderId,
                total: total,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Get semua order user
 */
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get User Orders Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Get detail order
 */
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

        if (orders.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order tidak ditemukan' 
            });
        }

        const [orderItems] = await db.query(
            'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...orders[0],
                items: orderItems
            }
        });

    } catch (error) {
        console.error('Get Order Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Update status order (admin only)
 */
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status wajib diisi' 
            });
        }

        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            message: 'Order berhasil diupdate'
        });

    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE orders SET status = "cancelled" WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            message: 'Order berhasil dibatalkan'
        });

    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};
