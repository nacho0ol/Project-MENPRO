const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load Env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import Middlewares
const { requestLogger, setHeaders } = require('./middlewares/common');
const { errorHandler, sanitizeInput } = require('./middlewares/validation');

// Import Routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// ===== MIDDLEWARE SETUP =====
app.use(cors()); // Biar HTML bisa akses backend
app.use(bodyParser.json()); // Biar bisa baca JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger); // Log setiap request
app.use(setHeaders); // Set response headers
app.use(sanitizeInput); // Sanitasi input


// ===== HOME ROUTE - Redirect ke login =====
app.get('/', (req, res) => {
    res.redirect('/public/login.html');
});

// ===== STATIC FILES =====
app.use(express.static('public'));
app.use(express.static('.')); // Serve files dari root folder


// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// ===== KONEKSI DATABASE =====
require('./config/database');

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan',
        path: req.path
    });
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== JALANKAN SERVER =====
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`${'='.repeat(50)}\n`);
});