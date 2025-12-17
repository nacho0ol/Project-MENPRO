const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load Env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Biar HTML bisa akses backend
app.use(bodyParser.json()); // Biar bisa baca JSON
app.use(bodyParser.urlencoded({ extended: true }));

// Test Route (Buat ngecek server nyala atau ngga)
app.get('/', (req, res) => {
    res.send('Backend Server is Running! 🚀');
});

// Import Koneksi DB (Supaya script database.js jalan)
require('./config/database');

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});