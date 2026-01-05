const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi Multer untuk upload gambar
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Buat nama file unik dengan timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format gambar tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP'));
        }
    }
});

/**
 * @route   POST /api/admin/upload
 * @desc    Upload gambar produk
 * @access  Admin
 */
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada file yang diupload'
            });
        }

        // URL relatif untuk disimpan ke database
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Gambar berhasil diupload',
            data: {
                filename: req.file.filename,
                url: fileUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal upload gambar'
        });
    }
});

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

// ==========================================
// MANAJEMEN USER (ADMIN KHUSUS TABEL USER)
// ==========================================

// GET ALL USERS (Admin & Customer, Tampilan Tabel User)
router.get('/users', async (req, res) => {
    try {
        const sql = 'SELECT idUser, username, email, role, created_at FROM User ORDER BY idUser ASC';
        const [users] = await db.query(sql);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE USER BARU (Hanya Tabel User)
router.post('/users', async (req, res) => {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap!' });
    }

    try {
        // Cek duplikat
        const [exist] = await db.query('SELECT idUser FROM User WHERE username = ? OR email = ?', [username, email]);
        if(exist.length > 0) return res.status(409).json({ success: false, message: 'Username/Email sudah dipakai' });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User
        await db.query(
            'INSERT INTO User (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        res.status(201).json({ success: true, message: 'User berhasil dibuat' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal membuat user' });
    }
});

// UPDATE USER
router.put('/users/:id', async (req, res) => {
    const idUser = req.params.id;
    const { email, role, password } = req.body;

    try {
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE User SET email = ?, role = ?, password = ? WHERE idUser = ?', 
                [email, role, hashedPassword, idUser]);
        } else {
            await db.query('UPDATE User SET email = ?, role = ? WHERE idUser = ?', 
                [email, role, idUser]);
        }
        res.json({ success: true, message: 'User diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE USER (Endpoint ini bisa dipakai untuk tombol hapus di tabel User juga)
router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM User WHERE idUser = ?', [req.params.id]);
        res.json({ success: true, message: 'User dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
