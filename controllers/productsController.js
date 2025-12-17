const db = require('../config/database');

/**
 * Get semua produk
 */
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE status = "active"');

        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Get All Products Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Get detail produk
 */
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(
            'SELECT * FROM products WHERE id = ? AND status = "active"',
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produk tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: products[0]
        });

    } catch (error) {
        console.error('Get Product Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Create produk baru (admin only)
 */
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;

        // Validasi input
        if (!name || !price || !stock) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nama, harga, dan stok wajib diisi' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO products (name, description, price, stock, category, status) VALUES (?, ?, ?, ?, ?, "active")',
            [name, description || null, price, stock, category || null]
        );

        res.status(201).json({
            success: true,
            message: 'Produk berhasil dibuat',
            data: {
                id: result.insertId,
                name,
                price,
                stock
            }
        });

    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Update produk (admin only)
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category } = req.body;

        const [result] = await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?',
            [name, description, price, stock, category, id]
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
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Delete produk (admin only)
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE products SET status = "inactive" WHERE id = ?',
            [id]
        );

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
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};
