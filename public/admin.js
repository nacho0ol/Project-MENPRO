// API Base URL
const API_URL = 'http://localhost:3000/api';

// ===== LOAD DATA SAAT HALAMAN DIBUKA =====
document.addEventListener('DOMContentLoaded', function() {
    // Check role admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
        alert("Akses Ditolak! Silakan login sebagai Admin.");
        window.location.href = 'login.html';
        return;
    }

    // Load data produk
    loadProducts();
    loadOrders();
    loadCustomers();
});

// ===== LOAD PRODUK =====
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/admin/products`);
        const result = await response.json();

        if (!result.success) {
            console.error('Gagal load produk:', result.message);
            return;
        }

        const products = result.data;
        const tbody = document.querySelector('.products-table tbody');
        tbody.innerHTML = '';

        products.forEach(prod => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${prod.filepath || 'https://via.placeholder.com/50'}" class="prod-img" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td>${prod.namaProduk}</td>
                <td>Rp ${formatCurrency(prod.harga)}</td>
                <td>
                    <span class="stock-badge ${prod.stokKG > 10 ? 'safe' : 'low'}">
                        ${prod.stokKG} Kg
                    </span>
                </td>
                <td>
                    <button class="btn-icon plus" onclick="updateStock(${prod.idProduk}, 'masuk')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-icon minus" onclick="updateStock(${prod.idProduk}, 'keluar')">
                        <i class="fas fa-minus"></i>
                    </button>
                </td>
                <td>
                    <button class="btn-action edit" onclick="editProduct(${prod.idProduk})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteProduct(${prod.idProduk})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// ===== UPDATE STOK =====
async function updateStock(idProduk, tipe) {
    const jumlah = prompt(`Masukkan jumlah stok yang ${tipe === 'masuk' ? 'masuk' : 'keluar'} (Kg):`);
    
    if (jumlah === null || jumlah === '') return;
    if (isNaN(jumlah) || parseFloat(jumlah) <= 0) {
        alert('Jumlah harus angka positif');
        return;
    }

    const keterangan = prompt('Keterangan (opsional):') || '';

    try {
        const response = await fetch(`${API_URL}/admin/stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idProduk,
                tipe,
                jumlah: parseFloat(jumlah),
                keterangan
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Stok berhasil diupdate!');
            loadProducts();
        } else {
            alert('Gagal update stok: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Terjadi kesalahan saat update stok');
    }
}

// ===== DELETE PRODUK =====
async function deleteProduct(idProduk) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/products/${idProduk}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('Produk berhasil dihapus!');
            loadProducts();
        } else {
            alert('Gagal hapus produk: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Terjadi kesalahan saat hapus produk');
    }
}

// ===== EDIT PRODUK =====
function editProduct(idProduk) {
    alert('Fitur edit produk akan segera tersedia');
    // TODO: Buka modal edit produk
}

// ===== LOAD ORDERS =====
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`);
        const result = await response.json();

        if (!result.success) {
            console.error('Gagal load orders:', result.message);
            return;
        }

        const orders = result.data;
        const tbody = document.querySelector('.orders-table tbody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            const namaCustomer = `${order.namaDepan || 'N/A'} ${order.namaBelakang || ''}`;
            
            row.innerHTML = `
                <td>#${String(order.idPemesanan).padStart(4, '0')}</td>
                <td>${namaCustomer}</td>
                <td>Rp ${formatCurrency(order.totalBelanja)}</td>
                <td>${order.Status}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus(${order.idPemesanan}, this.value)">
                        <option value="dipesan" ${order.Status === 'dipesan' ? 'selected' : ''}>Dipesan</option>
                        <option value="diproses" ${order.Status === 'diproses' ? 'selected' : ''}>Diproses</option>
                        <option value="dikirim" ${order.Status === 'dikirim' ? 'selected' : ''}>Dikirim</option>
                        <option value="sukses" ${order.Status === 'sukses' ? 'selected' : ''}>Sukses</option>
                        <option value="batal" ${order.Status === 'batal' ? 'selected' : ''}>Batal</option>
                    </select>
                </td>
                <td>
                    <button class="btn-view" onclick="viewOrderDetail(${order.idPemesanan})">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// ===== UPDATE ORDER STATUS =====
async function updateOrderStatus(idPemesanan, newStatus) {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${idPemesanan}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            alert('Status pesanan berhasil diupdate!');
            loadOrders();
        } else {
            alert('Gagal update status: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Terjadi kesalahan saat update status');
    }
}

// ===== VIEW ORDER DETAIL (DIPERBAIKI) =====
async function viewOrderDetail(idPemesanan) {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${idPemesanan}`);
        const result = await response.json();

        if (!result.success) {
            alert('Gagal load detail order');
            return;
        }

        const { order, items } = result.data;
        
        let itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px;">${item.namaProduk}</td>
                <td style="padding: 10px;">${item.qtyPesanan} Kg</td>
                <td style="padding: 10px;">Rp ${formatCurrency(item.hargaSatuan)}</td>
                <td style="padding: 10px;">Rp ${formatCurrency(item.subtotal)}</td>
            </tr>
        `).join('');

        // Membangun HTML untuk ditampilkan di Modal
        const html = `
            <h3 style="color: #24214B; margin-bottom: 10px;">Detail Pesanan #${String(idPemesanan).padStart(4, '0')}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <p><strong>Nama:</strong> ${order.namaDepan} ${order.namaBelakang}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                    <p><strong>No. Telp:</strong> ${order.no_telp}</p>
                    <p><strong>Alamat:</strong> ${order.alamat}</p>
                </div>
                <div>
                    <p><strong>Tanggal:</strong> ${new Date(order.tanggalPesan).toLocaleString('id-ID')}</p>
                    <p><strong>Status:</strong> ${order.Status.toUpperCase()}</p>
                </div>
            </div>

            <h4 style="margin-bottom: 10px;">Item Pesanan:</h4>
            <table width="100%" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
                <thead style="background: #f1f5f9;">
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px;"><strong>Produk</strong></td>
                        <td style="padding: 10px;"><strong>Qty</strong></td>
                        <td style="padding: 10px;"><strong>Harga</strong></td>
                        <td style="padding: 10px;"><strong>Subtotal</strong></td>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot style="background: #f8f9fa;">
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 8px;"><strong>Total Belanja:</strong></td>
                        <td style="padding: 8px;">Rp ${formatCurrency(order.totalBelanja)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 8px;"><strong>Ongkir:</strong></td>
                        <td style="padding: 8px;">Rp ${formatCurrency(order.ongkir)}</td>
                    </tr>
                    <tr style="font-size: 1.1em; color: #24214B;">
                        <td colspan="3" style="text-align: right; padding: 10px;"><strong>Grand Total:</strong></td>
                        <td style="padding: 10px;"><strong>Rp ${formatCurrency(order.grandTotal)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        `;

        // Masukkan HTML ke Modal dan tampilkan
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('orderModal').style.display = 'block';

    } catch (error) {
        console.error('Error viewing order detail:', error);
        alert('Terjadi kesalahan');
    }
}

// ===== FUNGSI TUTUP MODAL =====
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// Tutup modal jika user klik area gelap di luar box
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/admin/customers`);
        const result = await response.json();

        if (!result.success) {
            console.error('Gagal load customers:', result.message);
            return;
        }

        const customers = result.data;
        const tbody = document.querySelector('.customers-table tbody');
        tbody.innerHTML = '';

        customers.forEach(cust => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cust.namaDepan} ${cust.namaBelakang || 'N/A'}</td>
                <td>${cust.email}</td>
                <td>${cust.no_telp || 'N/A'}</td>
                <td>${cust.alamat || 'N/A'}</td>
                <td>
                    <button class="btn-action delete" onclick="deleteCustomer(${cust.idUser})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// ===== DELETE CUSTOMER =====
async function deleteCustomer(idUser) {
    if (!confirm('Yakin ingin menghapus customer ini? Semua data akan dihapus.')) return;

    try {
        const response = await fetch(`${API_URL}/admin/customers/${idUser}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('Customer berhasil dihapus!');
            loadCustomers();
        } else {
            alert('Gagal hapus customer: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Terjadi kesalahan saat hapus customer');
    }
}

// ===== LOGOUT =====
function logoutAdmin() {
    if(confirm("Apakah Anda yakin ingin keluar?")) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }
}

// ===== HELPER FUNCTION =====
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID').format(value);
}