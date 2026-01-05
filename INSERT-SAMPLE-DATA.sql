-- ============================================
-- INSERT DATA PRODUK SAMPLE
-- ============================================

INSERT INTO Produk (namaProduk, harga, stokKG, deskripsi, filepath) VALUES
('Sirloin Premium', 140000, 50, 'Sirloin daging sapi premium kualitas terbaik', 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=500&q=60'),
('Iga Sapi (Ribs)', 196000, 40, 'Iga sapi segar dengan kualitas premium, cocok untuk grilling', 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=500&q=60'),
('Hati Sapi Segar', 40000, 60, 'Hati sapi segar berkualitas tinggi, sangat bergizi', 'https://images.unsplash.com/photo-1615937651187-8c489680b9b0?auto=format&fit=crop&w=500&q=60'),
('Oxtail Super', 180000, 35, 'Ekor sapi premium untuk sup dan masakan tradisional', 'https://images.unsplash.com/photo-1551028716-43a595d7b51b?auto=format&fit=crop&w=500&q=60');

-- ============================================
-- VERIFIKASI DATA
-- ============================================

SELECT * FROM Produk;

-- ============================================
-- CATATAN:
-- 1. Data produk sudah tersimpan di tabel Produk
-- 2. Frontend akan mengambil data dari /api/products
-- 3. Saat checkout, data customer akan otomatis tersimpan di profilCustomer
-- 4. Data order akan tersimpan di Pemesanan dan ItemPemesanan
-- ============================================
