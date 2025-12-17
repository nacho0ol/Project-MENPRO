const db = require('../config/database');

/**
 * Get cart user
 */
exports.getCart = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        const [cartItems] = await db.query(
            `SELECT c.*, p.name, p.price 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`,
            [userId]
        );

        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        res.json({
            success: true,
            data: {
                items: cartItems,
                total: total,
                count: cartItems.length
            }
        });

    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Add item ke cart
 */
exports.addToCart = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { product_id, quantity } = req.body;

        if (!userId || !product_id || !quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID, product ID, dan quantity wajib diisi' 
            });
        }

        // Cek apakah item sudah di cart
        const [existingItem] = await db.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );

        if (existingItem.length > 0) {
            // Update quantity
            await db.query(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, userId, product_id]
            );
        } else {
            // Insert item baru
            await db.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, product_id, quantity]
            );
        }

        res.json({
            success: true,
            message: 'Item berhasil ditambahkan ke cart'
        });

    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Update quantity item di cart
 */
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity harus lebih besar dari 0' 
            });
        }

        const [result] = await db.query(
            'UPDATE cart SET quantity = ? WHERE id = ?',
            [quantity, itemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item tidak ditemukan di cart' 
            });
        }

        res.json({
            success: true,
            message: 'Item berhasil diupdate'
        });

    } catch (error) {
        console.error('Update Cart Item Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Remove item dari cart
 */
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const [result] = await db.query('DELETE FROM cart WHERE id = ?', [itemId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item tidak ditemukan di cart' 
            });
        }

        res.json({
            success: true,
            message: 'Item berhasil dihapus dari cart'
        });

    } catch (error) {
        console.error('Remove from Cart Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Clear semua item di cart
 */
exports.clearCart = async (req, res) => {
    try {
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        res.json({
            success: true,
            message: 'Cart berhasil dikosongkan'
        });

    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};
