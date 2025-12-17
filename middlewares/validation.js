/**
 * Middleware untuk validasi input
 */
exports.validateInput = (req, res, next) => {
    const { email, password } = req.body;

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Format email tidak valid' 
        });
    }

    // Validasi password panjang
    if (password && password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password minimal 6 karakter' 
        });
    }

    next();
};

/**
 * Middleware untuk sanitasi input
 */
exports.sanitizeInput = (req, res, next) => {
    // Hapus whitespace di awal dan akhir
    for (let key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim();
        }
    }
    next();
};

/**
 * Middleware untuk error handling
 */
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
