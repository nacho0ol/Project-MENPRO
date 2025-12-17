const bcrypt = require('bcrypt');
const db = require('../config/database');

/**
 * Register user baru
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, email, dan password wajib diisi' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password minimal 6 karakter' 
            });
        }

        // Cek apakah username atau email sudah terdaftar
        const [existingUser] = await db.query(
            'SELECT * FROM user WHERE username = ? OR email = ?', 
            [username, email]
        );
        
        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username atau email sudah terdaftar' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru ke database dengan role Customer
        const [result] = await db.query(
            'INSERT INTO User (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, 'Customer']
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Silakan login',
            data: {
                idUser: result.insertId,
                username,
                email,
                role: 'Customer'
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat registrasi',
            error: error.message 
        });
    }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username/Email dan password wajib diisi' 
            });
        }

        // Cek user di database (bisa username atau email)
        const [users] = await db.query(
            'SELECT * FROM User WHERE username = ? OR email = ?', 
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username/Email atau password salah' 
            });
        }

        const user = users[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username/Email atau password salah' 
            });
        }

        // Login berhasil
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                idUser: user.idUser,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat login',
            error: error.message 
        });
    }
};

/**
 * Logout user
 */
exports.logout = (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout berhasil'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat logout' 
        });
    }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        const [users] = await db.query(
            'SELECT idUser, username, email, role, created_at FROM User WHERE idUser = ?',
            [userId]
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
        console.error('Get Profile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};
