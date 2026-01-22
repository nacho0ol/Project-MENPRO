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
  - MySQL (MYQL WorkBench

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
npm run dev

-----
```

### Visualisasi 

<img width="1919" height="995" alt="Screenshot 2026-01-22 174239" src="https://github.com/user-attachments/assets/9ac12d76-ab3a-40a9-966a-aa58860f2f0d" />
<img width="1919" height="946" alt="Screenshot 2026-01-22 174256" src="https://github.com/user-attachments/assets/a22241e2-3c9c-42f0-b840-05e3fb1d4b51" />
<img width="1919" height="987" alt="Screenshot 2026-01-22 174310" src="https://github.com/user-attachments/assets/2cd2d521-ff7e-43af-9375-a86ebe824552" />
<img width="1918" height="983" alt="Screenshot 2026-01-22 174341" src="https://github.com/user-attachments/assets/f832a82e-cbe1-463c-84a0-6e9d08805669" />
<img width="1919" height="986" alt="Screenshot 2026-01-22 174358" src="https://github.com/user-attachments/assets/e6051e98-747d-4575-b42d-f8c600777147" />
<img width="1919" height="989" alt="Screenshot 2026-01-22 174443" src="https://github.com/user-attachments/assets/b6361c4e-8ba2-4dfb-a3be-fc855e668859" />
<img width="1919" height="985" alt="Screenshot 2026-01-22 174513" src="https://github.com/user-attachments/assets/df17d242-c9f7-4680-a2bc-60c4ec9731f5" />
<img width="1919" height="960" alt="Screenshot 2026-01-22 174522" src="https://github.com/user-attachments/assets/a73085ef-c8dc-4166-9e9b-75056542bb90" />
<img width="1919" height="981" alt="Screenshot 2026-01-22 174814" src="https://github.com/user-attachments/assets/300b5c5a-5ea9-4b58-815d-564154b6e12f" />
<img width="1919" height="991" alt="Screenshot 2026-01-22 174846" src="https://github.com/user-attachments/assets/5ed825e4-91f5-4de0-95c3-32a9904a452d" />
<img width="1919" height="1000" alt="Screenshot 2026-01-22 174858" src="https://github.com/user-attachments/assets/8e945369-d1c7-4b45-b7ad-48f220395036" />
<img width="1919" height="986" alt="Screenshot 2026-01-22 174910" src="https://github.com/user-attachments/assets/0ac4af46-8539-4483-a525-cc8865a33f8c" />





