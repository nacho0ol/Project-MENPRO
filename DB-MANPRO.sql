create database daging;

-- 1. Table USER
CREATE TABLE User (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Ingat: Ini menyimpan Hash
    role ENUM('Customer', 'Admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Validasi Username: Huruf, Angka, Underscore
    CONSTRAINT chk_username CHECK (username REGEXP '^[a-zA-Z0-9_]+$'),
    -- Validasi Email: Simple check ada @ dan .
    CONSTRAINT chk_email CHECK (email LIKE '%_@__%.__%')
);

-- 2. Table PROFIL CUSTOMER
CREATE TABLE profilCustomer (
    idProfil INT AUTO_INCREMENT PRIMARY KEY,
    idUser INT NOT NULL,
    namaDepan VARCHAR(50) NOT NULL,
    namaBelakang VARCHAR(50) NOT NULL,
    alamat VARCHAR(255) NOT NULL,
    no_telp VARCHAR(15) NOT NULL UNIQUE,

    -- Nama: Huruf dan Spasi
    CONSTRAINT chk_nama_depan CHECK (namaDepan REGEXP '^[a-zA-Z ]+$'),
    CONSTRAINT chk_nama_belakang CHECK (namaBelakang REGEXP '^[a-zA-Z ]+$'),
    -- Alamat: Huruf, angka, spasi, titik, koma
    CONSTRAINT chk_alamat CHECK (alamat REGEXP '^[a-zA-Z0-9 .,]+$'),
    -- No Telp: Angka saja, panjang 10-15
    CONSTRAINT chk_telp_numeric CHECK (no_telp REGEXP '^[0-9]+$'),
    CONSTRAINT chk_telp_len CHECK (LENGTH(no_telp) BETWEEN 10 AND 15),

    FOREIGN KEY (idUser) REFERENCES User(idUser) ON DELETE CASCADE
);

-- 3. Table PRODUK (Katalog & Buffer Stok)
CREATE TABLE Produk (
    idProduk INT AUTO_INCREMENT PRIMARY KEY,
    namaProduk VARCHAR(50) NOT NULL,
    harga DECIMAL(18, 2) NOT NULL,
    stokKG DECIMAL(18, 2) NOT NULL DEFAULT 0, -- Ini Buffer Stock (Sisa)
    deskripsi VARCHAR(255),
    filepath VARCHAR(255),

    -- Harga < 1 Juta
    CONSTRAINT chk_harga_max CHECK (harga >= 0 AND harga < 1000000),
    -- Stok Buffer <= 100kg
    CONSTRAINT chk_stok_max CHECK (stokKG >= 0 AND stokKG <= 100)
);

-- 4. Table PEMESANAN (Header)
CREATE TABLE Pemesanan (
    idPemesanan INT AUTO_INCREMENT PRIMARY KEY,
    idUser INT NOT NULL,
    tanggalPesan DATETIME DEFAULT CURRENT_TIMESTAMP,
    tanggalDikirim DATE,
    totalBelanja DECIMAL(18, 2) NOT NULL DEFAULT 0,
    ongkir DECIMAL(18, 2) NOT NULL DEFAULT 0,
    grandTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
    Status ENUM('dipesan', 'diproses', 'dikirim', 'sukses', 'batal') NOT NULL DEFAULT 'dipesan',
    
    -- Validasi Tanggal Kirim (Logic di Backend/SP lebih aman, tapi ini basic constraint)
    CONSTRAINT chk_tgl_kirim CHECK (tanggalDikirim IS NULL OR tanggalDikirim >= DATE(tanggalPesan)),
    -- Max Transaksi < 100 Juta
    CONSTRAINT chk_total_max CHECK (grandTotal < 100000000),

    FOREIGN KEY (idUser) REFERENCES User(idUser)
);

-- 5. Table ITEM PEMESANAN (Detail)
CREATE TABLE ItemPemesanan (
    idItem INT AUTO_INCREMENT PRIMARY KEY,
    idPemesanan INT NOT NULL,
    idProduk INT NOT NULL,
    qtyPesanan DECIMAL(18, 2) NOT NULL,
    hargaSatuan DECIMAL(18, 2) NOT NULL,
    subtotal DECIMAL(18, 2) NOT NULL, -- (qty * hargaSatuan)

    -- Qty max 100kg per item
    CONSTRAINT chk_qty_max CHECK (qtyPesanan > 0 AND qtyPesanan <= 100),

    FOREIGN KEY (idPemesanan) REFERENCES Pemesanan(idPemesanan) ON DELETE CASCADE,
    FOREIGN KEY (idProduk) REFERENCES Produk(idProduk)
);

-- 6. Table RIWAYAT STOK (Log Mutasi Buffer)
CREATE TABLE RiwayatStok (
    idRiwayat INT AUTO_INCREMENT PRIMARY KEY,
    idProduk INT NOT NULL,
    type ENUM('masuk', 'keluar', 'penyesuaian') NOT NULL,
    jumlah DECIMAL(18, 2) NOT NULL,
    keterangan VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (idProduk) REFERENCES Produk(idProduk)
);

DELIMITER $$

CREATE PROCEDURE sp_RegisterCustomer(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_namaDepan VARCHAR(50),
    IN p_namaBelakang VARCHAR(50),
    IN p_alamat VARCHAR(255),
    IN p_noTelp VARCHAR(15)
)
BEGIN
    -- Error Handling: Kalau ada error, Rollback (Batalin semua)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'ERROR' AS Status, 'Gagal mendaftar, terjadi kesalahan sistem.' AS Message;
    END;

    START TRANSACTION;

    -- 1. Insert ke tabel User
    INSERT INTO User (username, email, password, role) 
    VALUES (p_username, p_email, p_password, 'Customer');

    -- Ambil ID User yang baru aja dibuat
    SET @new_id = LAST_INSERT_ID();

    -- 2. Insert ke tabel Profil
    INSERT INTO profilCustomer (idUser, namaDepan, namaBelakang, alamat, no_telp)
    VALUES (@new_id, p_namaDepan, p_namaBelakang, p_alamat, p_noTelp);

    COMMIT;
    
    -- Return sukses
    SELECT 'SUCCESS' AS Status, 'Registrasi berhasil' AS Message, @new_id AS UserID;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_UpdateStokAdmin(
    IN p_idProduk INT,
    IN p_tipe ENUM('masuk', 'keluar'), -- Pilih 'masuk' atau 'keluar'
    IN p_jumlah DECIMAL(18,2),
    IN p_keterangan VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'ERROR' AS Status, 'Gagal update stok.' AS Message;
    END;

    START TRANSACTION;

    -- 1. Catat ke RiwayatStok (Log)
    INSERT INTO RiwayatStok (idProduk, type, jumlah, keterangan)
    VALUES (p_idProduk, p_tipe, p_jumlah, p_keterangan);

    -- 2. Update Stok di Produk
    IF p_tipe = 'masuk' THEN
        UPDATE Produk SET stokKG = stokKG + p_jumlah WHERE idProduk = p_idProduk;
    ELSE
        -- Kalau keluar, kurangi stok
        UPDATE Produk SET stokKG = stokKG - p_jumlah WHERE idProduk = p_idProduk;
    END IF;

    COMMIT;
    
    SELECT 'SUCCESS' AS Status, 'Stok berhasil diupdate' AS Message;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_CheckoutFull(
    IN p_idUser INT,
    IN p_ongkir DECIMAL(18,2),
    IN p_items JSON -- Data item dikirim dalam format JSON Array
)
BEGIN
    DECLARE v_idPemesanan INT;
    DECLARE v_totalBelanja DECIMAL(18,2) DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'ERROR' AS Status, 'Gagal membuat pesanan.' AS Message;
    END;

    START TRANSACTION;

    -- 1. Buat Header Pemesanan (Total 0 dulu)
    INSERT INTO Pemesanan (idUser, tanggalPesan, totalBelanja, ongkir, grandTotal, Status)
    VALUES (p_idUser, NOW(), 0, p_ongkir, 0, 'dipesan');
    
    SET v_idPemesanan = LAST_INSERT_ID();

    -- 2. Insert Items dari JSON secara Massal
    -- Ini teknik canggih 'JSON_TABLE' untuk ubah JSON jadi Tabel sementara
    INSERT INTO ItemPemesanan (idPemesanan, idProduk, qtyPesanan, hargaSatuan, subtotal)
    SELECT 
        v_idPemesanan,
        jt.idProduk,
        jt.qty,
        p.harga, -- Ambil harga dari tabel Produk (biar aman dari manipulasi frontend)
        (p.harga * jt.qty) -- Hitung subtotal
    FROM JSON_TABLE(p_items, '$[*]' COLUMNS (
        idProduk INT PATH '$.idProduk',
        qty DECIMAL(18,2) PATH '$.qty'
    )) AS jt
    JOIN Produk p ON p.idProduk = jt.idProduk;

    -- 3. Hitung Ulang Total Belanja & Update Header
    SELECT SUM(subtotal) INTO v_totalBelanja 
    FROM ItemPemesanan 
    WHERE idPemesanan = v_idPemesanan;

    UPDATE Pemesanan 
    SET totalBelanja = v_totalBelanja,
        grandTotal = v_totalBelanja + p_ongkir
    WHERE idPemesanan = v_idPemesanan;

    COMMIT;

    -- Return ID Pesanan buat dilempar ke WhatsApp
    SELECT 'SUCCESS' AS Status, v_idPemesanan AS OrderID, v_totalBelanja + p_ongkir AS GrandTotal;
END$$

DELIMITER ;

-- TEST REGISTER
CALL sp_RegisterCustomer('budi01', 'budi@email.com', 'hashpassword123', 'Budi', 'Santoso', 'Jl. Mawar No 1', '081234567890');


-- Masukkan produk dulu biar ID 1 ada
INSERT INTO Produk (namaProduk, harga, stokKG, deskripsi) 
VALUES ('Daging Sapi Premium', 120000, 0, 'Daging segar kualitas super');

CALL sp_UpdateStokAdmin(1, 'masuk', 50, 'Restock Pasar Induk');


-- test admin stock out
-- ID Produk 1, Tipe 'keluar', Jumlah 2kg, Ket 'Daging rusak'
CALL sp_UpdateStokAdmin(1, 'keluar', 2, 'Daging rusak/busuk');

-- test customer checkout
CALL sp_CheckoutFull(
    1,          -- ID User
    15000,      -- Ongkir
    '[{"idProduk": 1, "qty": 5}, {"idProduk": 2, "qty": 1}]' -- List Barang
);