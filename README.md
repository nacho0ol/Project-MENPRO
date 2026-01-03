<div align="center">
  <h1>Project MENPRO (Daging Segar)</h1>
  <p><strong>Aplikasi Web E-Commerce Full-Stack untuk Penjualan Daging Segar</strong></p>
  <p>Proyek Pengembangan Aplikasi Web - Sistem Manajemen Penjualan Produk Hewani</p>
</div>

-----

## Daftar Isi
  - [Fitur Utama](#fitur-utama)
  - [Teknologi yang Digunakan](#teknologi-yang-digunakan)
  - [Struktur Database](#struktur-database)
  - [Instalasi dan Menjalankan Proyek](#instalasi-dan-menjalankan-proyek)
  - [Dokumentasi API](#dokumentasi-api)
  - [Struktur Folder](#struktur-folder)

-----

**Project MENPRO** adalah aplikasi web E-commerce khusus penjualan daging yang dibangun menggunakan Node.js, Express, dan MySQL. Aplikasi ini dirancang untuk mempermudah pelanggan dalam memesan daging segar secara online dan membantu admin dalam mengelola inventaris stok secara akurat.

## Fitur Utama

  - **Untuk Pelanggan (Buyer):**
      - **Otentikasi:** Registrasi akun dan Login yang aman menggunakan enkripsi password `bcrypt`.
      - **Katalog Produk:** Menampilkan daftar daging segar beserta harga dan informasi stok terkini.
      - **Manajemen Keranjang:** Menambah, melihat, dan menghapus item dari keranjang belanja.
      - **Proses Checkout:** Melakukan pemesanan resmi yang terintegrasi dengan database.
      - **Profil Pengguna:** Mengelola data diri, alamat pengiriman, dan nomor telepon.
  - **Untuk Admin:**
      - **Manajemen Stok:** Melakukan *restock* produk daging dengan sistem log riwayat stok otomatis.
      - **Manajemen Pesanan:** Memantau seluruh pesanan masuk dan status transaksi.
      - **Audit Log:** Pencatatan otomatis setiap perubahan stok untuk transparansi inventaris.

-----

## Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (dengan Stored Procedures & Triggers) |
| **Frontend** | HTML5, CSS3 murni, JavaScript (Vanilla JS) |
| **Keamanan** | Bcrypt (Password Hashing), Middleware Sanitasi Input |
| **Tools** | Dotenv (Environment Variables), MySQL2 |

-----

## Struktur Database

Proyek ini menggunakan database relasional dengan skema yang dioptimalkan menggunakan *Stored Procedures* untuk transaksi checkout.

1.  **User**: Menyimpan kredensial login dan role (Admin/Customer).
2.  **Produk**: Daftar jenis daging, harga per kg, dan jumlah stok.
3.  **Pemesanan & ItemPemesanan**: Mencatat transaksi belanja pelanggan.
4.  **RiwayatStok**: Log mutasi stok produk.

-----

## Dokumentasi API
| Method | Endpoint | Fungsi |
|------|---------|--------|
| POST | /api/auth/register | Mendaftarkan pengguna baru |
| POST | /api/auth/login | Masuk ke sistem |
| GET | /api/products | Mendapatkan daftar seluruh produk |
| POST | /api/cart/add | Menambah produk ke keranjang |
| POST | /api/orders/checkout | Memproses transaksi pemesanan |
| PUT | /api/admin/update-stok | (Admin) Update stok daging |


-----

## Struktur Folder
Project-MENPRO/
├── config/             # Berisi konfigurasi koneksi database
├── controllers/        # Berisi logika bisnis dan pengolahan request
├── middlewares/        # Berisi middleware validasi dan keamanan
├── public/             # Berisi file frontend (HTML, CSS, JavaScript)
├── routes/             # Berisi definisi endpoint API
├── utils/              # Berisi fungsi bantuan (helper)
├── app.js              # File utama aplikasi
└── DB-MANPRO.sql       # File skema dan struktur database


-----

## Instalasi dan Menjalankan Proyek

### Prasyarat
  - Node.js (v14+)
  - MySQL Server (XAMPP / MySQL Installer)

### 1. Persiapan Database
1. Buka MySQL Client (phpMyAdmin atau MySQL Workbench).
2. Buat database baru bernama `daging`.
3. Impor file skema yang tersedia: `DB-MANPRO.sql`.

### 2. Konfigurasi Environment
Buat file bernama `.env` di root direktori dan sesuaikan dengan akun database Anda:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=IsiPasswordDatabaseAnda
DB_NAME=daging
DB_PORT=3306
PORT=3000

### 3. Instalasi Dependensi
npm install

### 4. Jalankan aplikasi
npm start

-----





