const bcrypt = require('bcrypt');
const db = require('../config/database');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Get profil customer dari tabel profilCustomer
        const [profiles] = await db.query(
            'SELECT idProfil, idUser, namaDepan, namaBelakang, alamat, no_telp FROM profilCustomer WHERE idUser = ?',
            [id]
        );

        if (profiles.length === 0) {
            // Return empty profile jika belum ada
            return res.json({
                success: true,
                data: {
                    namaDepan: '',
                    namaBelakang: '',
                    alamat: '',
                    no_telp: ''
                }
            });
        }

        res.json({
            success: true,
            data: profiles[0]
        });

    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaDepan, namaBelakang, alamat, no_telp } = req.body;

        if (!namaDepan || !alamat || !no_telp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nama depan, alamat, dan nomor telp wajib diisi' 
            });
        }

        // Cek apakah profil sudah ada
        const [existingProfile] = await db.query(
            'SELECT idProfil FROM profilCustomer WHERE idUser = ?',
            [id]
        );

        if (existingProfile.length > 0) {
            // Update existing profile
            const [result] = await db.query(
                'UPDATE profilCustomer SET namaDepan = ?, namaBelakang = ?, alamat = ?, no_telp = ? WHERE idUser = ?',
                [namaDepan, namaBelakang || '-', alamat, no_telp, id]
            );

            if (result.affectedRows === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Gagal update profil' 
                });
            }
        } else {
            // Insert new profile
            await db.query(
                'INSERT INTO profilCustomer (idUser, namaDepan, namaBelakang, alamat, no_telp) VALUES (?, ?, ?, ?, ?)',
                [id, namaDepan, namaBelakang || '-', alamat, no_telp]
            );
        }

        res.json({
            success: true,
            message: 'Profile berhasil diupdate'
        });

    } catch (error) {
        console.error('Update User Profile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Old password dan new password wajib diisi' 
            });
        }

        // Get user
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, users[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Password lama salah' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Get semua users (admin only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, email, name, phone, role, created_at FROM users'
        );

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Get all addresses for user
 */
exports.getUserAddresses = async (req, res) => {
    try {
        const { id } = req.params;

        const [addresses] = await db.query(
            'SELECT idAlamat, namaPenerima, noTelp, alamat, labelAlamat, created_at FROM AlamatUser WHERE idUser = ? ORDER BY created_at DESC',
            [id]
        );

        res.json({
            success: true,
            data: addresses
        });

    } catch (error) {
        console.error('Get User Addresses Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Get specific address by ID
 */
exports.getAddressById = async (req, res) => {
    try {
        const { id, addrId } = req.params;

        const [address] = await db.query(
            'SELECT idAlamat, namaPenerima, noTelp, alamat, labelAlamat FROM AlamatUser WHERE idAlamat = ? AND idUser = ?',
            [addrId, id]
        );

        if (address.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alamat tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: address[0]
        });

    } catch (error) {
        console.error('Get Address Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Create new address
 */
exports.createAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaPenerima, noTelp, alamat, labelAlamat } = req.body;

        if (!namaPenerima || !noTelp || !alamat) {
            return res.status(400).json({
                success: false,
                message: 'Nama penerima, nomor telp, dan alamat wajib diisi'
            });
        }

        const [result] = await db.query(
            'INSERT INTO AlamatUser (idUser, namaPenerima, noTelp, alamat, labelAlamat) VALUES (?, ?, ?, ?, ?)',
            [id, namaPenerima, noTelp, alamat, labelAlamat || null]
        );

        res.status(201).json({
            success: true,
            message: 'Alamat berhasil ditambahkan',
            data: {
                idAlamat: result.insertId
            }
        });

    } catch (error) {
        console.error('Create Address Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Update address
 */
exports.updateAddress = async (req, res) => {
    try {
        const { id, addrId } = req.params;
        const { namaPenerima, noTelp, alamat, labelAlamat } = req.body;

        if (!namaPenerima || !noTelp || !alamat) {
            return res.status(400).json({
                success: false,
                message: 'Nama penerima, nomor telp, dan alamat wajib diisi'
            });
        }

        const [result] = await db.query(
            'UPDATE AlamatUser SET namaPenerima = ?, noTelp = ?, alamat = ?, labelAlamat = ? WHERE idAlamat = ? AND idUser = ?',
            [namaPenerima, noTelp, alamat, labelAlamat || null, addrId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alamat tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Alamat berhasil diperbarui'
        });

    } catch (error) {
        console.error('Update Address Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Delete address
 */
exports.deleteAddress = async (req, res) => {
    try {
        const { id, addrId } = req.params;

        const [result] = await db.query(
            'DELETE FROM AlamatUser WHERE idAlamat = ? AND idUser = ?',
            [addrId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alamat tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Alamat berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete Address Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

/**
 * Delete user account (admin only)
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete related data first
        await db.query('DELETE FROM cart WHERE user_id = ?', [id]);
        await db.query('DELETE FROM orders WHERE user_id = ?', [id]);

        // Delete user
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            message: 'User berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};
