const bcrypt = require('bcrypt');
const db = require('../config/database');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: users[0]
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
        const { name, phone } = req.body;

        const [result] = await db.query(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [name, phone, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
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
