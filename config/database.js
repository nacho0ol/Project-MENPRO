const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load config dari file .env
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ubah jadi Promise supaya bisa pakai async/await (lebih modern)
const db = pool.promise();

console.log("Mencoba menghubungkan ke Database...");

// Cek koneksi
db.getConnection()
    .then(conn => {
        console.log(`✅ Database Terhubung! [${process.env.DB_NAME}]`);
        conn.release();
    })
    .catch(err => {
        console.error("❌ Gagal Terkoneksi Dengan Database:", err.message);
    });

module.exports = db;