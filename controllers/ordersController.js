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
        const userId = req.query.userId || req.body?.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        // Query orders dari table Pemesanan dengan join ke ItemPemesanan
        const [orders] = await db.query(`
            SELECT 
                p.idPemesanan,
                p.idUser,
                p.tanggalPesan,
                p.tanggalDikirim,
                p.totalBelanja,
                p.ongkir,
                p.grandTotal,
                p.Status,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'idItem', ip.idItem,
                        'idProduk', ip.idProduk,
                        'qtyPesanan', ip.qtyPesanan,
                        'hargaSatuan', ip.hargaSatuan,
                        'subtotal', ip.subtotal,
                        'namaProduk', pr.namaProduk
                    )
                ) as items
            FROM Pemesanan p
            LEFT JOIN ItemPemesanan ip ON p.idPemesanan = ip.idPemesanan
            LEFT JOIN Produk pr ON ip.idProduk = pr.idProduk
            WHERE p.idUser = ?
            GROUP BY p.idPemesanan
            ORDER BY p.tanggalPesan DESC
        `, [userId]);

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

        const [orders] = await db.query(`
            SELECT 
                p.idPemesanan,
                p.idUser,
                p.tanggalPesan,
                p.tanggalDikirim,
                p.totalBelanja,
                p.ongkir,
                p.grandTotal,
                p.Status,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'idItem', ip.idItem,
                        'idProduk', ip.idProduk,
                        'qtyPesanan', ip.qtyPesanan,
                        'hargaSatuan', ip.hargaSatuan,
                        'subtotal', ip.subtotal,
                        'namaProduk', pr.namaProduk
                    )
                ) as items
            FROM Pemesanan p
            LEFT JOIN ItemPemesanan ip ON p.idPemesanan = ip.idPemesanan
            LEFT JOIN Produk pr ON ip.idProduk = pr.idProduk
            WHERE p.idPemesanan = ?
            GROUP BY p.idPemesanan
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: orders[0]
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
            'UPDATE Pemesanan SET Status = ? WHERE idPemesanan = ?',
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
            'UPDATE Pemesanan SET Status = ? WHERE idPemesanan = ?',
            ['Dibatalkan', id]
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
