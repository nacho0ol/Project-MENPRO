-- Tambahan tabel untuk menyimpan multiple addresses per user
-- Jalankan query ini di database sebelum menggunakan fitur "Alamat Saya"

CREATE TABLE AlamatUser (
    idAlamat INT AUTO_INCREMENT PRIMARY KEY,
    idUser INT NOT NULL,
    namaPenerima VARCHAR(100) NOT NULL,
    noTelp VARCHAR(15) NOT NULL,
    alamat TEXT NOT NULL,
    labelAlamat VARCHAR(50), -- e.g., "Rumah", "Kantor", "Orang Tua"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idUser) REFERENCES User(idUser) ON DELETE CASCADE,
    INDEX idx_user (idUser)
);
