const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * @route   GET /api/admin/products
 * @desc    Get semua produk dengan stok
 * @access  Admin
 */
router.get('/products', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM Produk ORDER BY idProduk DESC');
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data produk',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/admin/products
 * @desc    Create produk baru
 * @access  Admin
 */
router.post('/products', async (req, res) => {
    try {
        const { namaProduk, harga, stokKG, deskripsi, filepath } = req.body;

        if (!namaProduk || !harga) {
            return res.status(400).json({
                success: false,
                message: 'Nama produk dan harga wajib diisi'
            });
        }

        const [result] = await db.query(
            'INSERT INTO Produk (namaProduk, harga, stokKG, deskripsi, filepath) VALUES (?, ?, ?, ?, ?)',
            [namaProduk, harga, stokKG || 0, deskripsi || null, filepath || null]
        );

        res.status(201).json({
            success: true,
            message: 'Produk berhasil dibuat',
            data: {
                idProduk: result.insertId,
                namaProduk,
                harga,
                stokKG: stokKG || 0
            }
        });
    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat produk',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update produk
 * @access  Admin
 */
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { namaProduk, harga, deskripsi, filepath } = req.body;

        const [result] = await db.query(
            'UPDATE Produk SET namaProduk = ?, harga = ?, deskripsi = ?, filepath = ? WHERE idProduk = ?',
            [namaProduk, harga, deskripsi, filepath, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Produk berhasil diupdate'
        });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal update produk',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete produk
 * @access  Admin
 */
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM Produk WHERE idProduk = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Produk berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus produk',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/admin/stock
 * @desc    Update stok produk (masuk/keluar)
 * @access  Admin
 */
router.post('/stock', async (req, res) => {
    try {
        const { idProduk, tipe, jumlah, keterangan } = req.body;

        if (!idProduk || !tipe || !jumlah) {
            return res.status(400).json({
                success: false,
                message: 'ID produk, tipe, dan jumlah wajib diisi'
            });
        }

        // Gunakan stored procedure
        await db.query(
            'CALL sp_UpdateStokAdmin(?, ?, ?, ?)',
            [idProduk, tipe, jumlah, keterangan || null]
        );

        res.json({
            success: true,
            message: 'Stok berhasil diupdate'
        });
    } catch (error) {
        console.error('Update Stock Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal update stok',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get semua pesanan
 * @access  Admin
 */
router.get('/orders', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                p.idPemesanan,
                p.idUser,
                u.username,
                pc.namaDepan,
                pc.namaBelakang,
                p.tanggalPesan,
                p.totalBelanja,
                p.ongkir,
                p.grandTotal,
                p.Status
            FROM Pemesanan p
            LEFT JOIN User u ON p.idUser = u.idUser
            LEFT JOIN profilCustomer pc ON u.idUser = pc.idUser
            ORDER BY p.tanggalPesan DESC
        `);

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pesanan',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get detail pesanan
 * @access  Admin
 */
router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [order] = await db.query(`
            SELECT 
                p.idPemesanan,
                p.idUser,
                u.username,
                pc.namaDepan,
                pc.namaBelakang,
                pc.alamat,
                pc.no_telp,
                p.tanggalPesan,
                p.totalBelanja,
                p.ongkir,
                p.grandTotal,
                p.Status
            FROM Pemesanan p
            LEFT JOIN User u ON p.idUser = u.idUser
            LEFT JOIN profilCustomer pc ON u.idUser = pc.idUser
            WHERE p.idPemesanan = ?
        `, [id]);

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }

        const [items] = await db.query(`
            SELECT 
                ip.idItem,
                ip.idProduk,
                pr.namaProduk,
                ip.qtyPesanan,
                ip.hargaSatuan,
                ip.subtotal
            FROM ItemPemesanan ip
            JOIN Produk pr ON ip.idProduk = pr.idProduk
            WHERE ip.idPemesanan = ?
        `, [id]);

        res.json({
            success: true,
            data: {
                order: order[0],
                items: items
            }
        });
    } catch (error) {
        console.error('Get Order Detail Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail pesanan',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update status pesanan
 * @access  Admin
 */
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatus = ['dipesan', 'diproses', 'dikirim', 'sukses', 'batal'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid'
            });
        }

        const [result] = await db.query(
            'UPDATE Pemesanan SET Status = ? WHERE idPemesanan = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Status pesanan berhasil diupdate'
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal update status pesanan',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/customers
 * @desc    Get semua data pelanggan
 * @access  Admin
 */
router.get('/customers', async (req, res) => {
    try {
        const [customers] = await db.query(`
            SELECT 
                u.idUser,
                u.username,
                u.email,
                pc.namaDepan,
                pc.namaBelakang,
                pc.alamat,
                pc.no_telp,
                u.created_at
            FROM User u
            LEFT JOIN profilCustomer pc ON u.idUser = pc.idUser
            WHERE u.role = 'Customer'
            ORDER BY u.created_at DESC
        `);

        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Get Customers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pelanggan',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/admin/customers/:id
 * @desc    Delete customer
 * @access  Admin
 */
router.delete('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Hapus profil terlebih dahulu
        await db.query('DELETE FROM profilCustomer WHERE idUser = ?', [id]);
        
        // Hapus user
        const [result] = await db.query('DELETE FROM User WHERE idUser = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pelanggan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Pelanggan berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete Customer Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus pelanggan',
            error: error.message
        });
    }
});

module.exports = router;
