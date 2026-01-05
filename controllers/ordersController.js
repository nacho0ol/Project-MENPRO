const db = require('../config/database');

/**
 * Create order baru
 */
exports.createOrder = async (req, res) => {
    try {
        const { idUser, namaDepan, namaBelakang, no_telp, alamat, payment_method, items, ongkir } = req.body;

        if (!idUser || !namaDepan || !no_telp || !alamat || !items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data customer dan items wajib diisi' 
            });
        }

        // Hitung total belanja dari items
        let totalBelanja = 0;
        for (let item of items) {
            totalBelanja += item.hargaSatuan * item.qtyPesanan;
        }

        const grandTotal = totalBelanja + (ongkir || 0);

        // 1. Update atau Insert profil customer
        try {
            await db.query(
                'UPDATE profilCustomer SET namaDepan = ?, namaBelakang = ?, no_telp = ?, alamat = ? WHERE idUser = ?',
                [namaDepan, namaBelakang || '', no_telp, alamat, idUser]
            );
        } catch (e) {
            // Jika update gagal, coba insert
            await db.query(
                'INSERT INTO profilCustomer (idUser, namaDepan, namaBelakang, alamat, no_telp) VALUES (?, ?, ?, ?, ?)',
                [idUser, namaDepan, namaBelakang || '', alamat, no_telp]
            );
        }

        // 2. Create pemesanan
        const [orderResult] = await db.query(
            'INSERT INTO Pemesanan (idUser, totalBelanja, ongkir, grandTotal, Status) VALUES (?, ?, ?, ?, "dipesan")',
            [idUser, totalBelanja, ongkir || 0, grandTotal]
        );

        const idPemesanan = orderResult.insertId;

        // 3. Insert item pemesanan
        for (let item of items) {
            const subtotal = item.hargaSatuan * item.qtyPesanan;
            
            await db.query(
                'INSERT INTO ItemPemesanan (idPemesanan, idProduk, qtyPesanan, hargaSatuan, subtotal) VALUES (?, ?, ?, ?, ?)',
                [idPemesanan, item.idProduk, item.qtyPesanan, item.hargaSatuan, subtotal]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Order berhasil dibuat',
            data: {
                idPemesanan: idPemesanan,
                totalBelanja: totalBelanja,
                ongkir: ongkir || 0,
                grandTotal: grandTotal,
                status: 'dipesan'
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
