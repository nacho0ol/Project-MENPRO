const API_URL = 'http://localhost:3000/api';
let productsData = [];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Cek Login
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
        alert("Akses Ditolak!");
        window.location.href = 'login.html';
        return;
    }

    // 2. Setup Tombol Tambah Produk (Lama)
    const btnAdd = document.querySelector('.btn-add');
    if(btnAdd) {
        btnAdd.addEventListener('click', () => {
            document.getElementById('addProductModal').style.display = 'block';
        });
    }

    // 3. Setup Tombol Tambah User (Baru)
    const btnAddUser = document.getElementById('btnAddUser');
    if(btnAddUser) {
        btnAddUser.addEventListener('click', () => {
            openUserModal();
        });
    }

    // 4. Load Semua Data
    loadProducts();
    loadOrders();
    loadCustomers();
    loadUsers();
});

// =======================
// MODULE: PRODUK
// =======================
async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/admin/products`);
        const result = await res.json();
        if(result.success) {
            productsData = result.data;
            const tbody = document.querySelector('.products-table tbody');
            tbody.innerHTML = '';
            productsData.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${p.filepath || ''}" width="40" onerror="this.style.display='none'"></td>
                    <td>${p.namaProduk}</td>
                    <td>Rp ${formatCurrency(p.harga)}</td>
                    <td><span class="stock-badge ${p.stokKG > 10 ? 'safe' : 'low'}">${p.stokKG} Kg</span></td>
                    <td>
                        <button class="btn-icon plus" onclick="updateStock(${p.idProduk}, 'masuk')">+</button>
                        <button class="btn-icon minus" onclick="updateStock(${p.idProduk}, 'keluar')">-</button>
                    </td>
                    <td>
                        <button class="btn-action edit" onclick="editProduct(${p.idProduk})"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" onclick="deleteProduct(${p.idProduk})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch(e) { console.error(e); }
}

async function updateStock(id, tipe) {
    const jml = prompt(`Jumlah stok ${tipe} (Kg):`);
    if(!jml) return;
    await fetch(`${API_URL}/admin/stock`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({idProduk: id, tipe, jumlah: parseFloat(jml), keterangan: ''})
    });
    loadProducts();
}

function editProduct(id) {
    const p = productsData.find(x => x.idProduk === id);
    if(p) {
        document.getElementById('edit_id').value = p.idProduk;
        document.getElementById('edit_nama').value = p.namaProduk;
        document.getElementById('edit_harga').value = p.harga;
        document.getElementById('edit_gambar').value = p.filepath || '';
        document.getElementById('edit_deskripsi').value = p.deskripsi || '';
        document.getElementById('editProductModal').style.display = 'block';
    }
}
function closeEditModal() { document.getElementById('editProductModal').style.display = 'none'; }

async function submitEditProduct(e) {
    e.preventDefault();
    const id = document.getElementById('edit_id').value;
    const body = {
        namaProduk: document.getElementById('edit_nama').value,
        harga: document.getElementById('edit_harga').value,
        filepath: document.getElementById('edit_gambar').value,
        deskripsi: document.getElementById('edit_deskripsi').value
    };
    await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    closeEditModal();
    loadProducts();
}

async function deleteProduct(id) {
    if(confirm('Hapus produk?')) {
        await fetch(`${API_URL}/admin/products/${id}`, {method: 'DELETE'});
        loadProducts();
    }
}
function closeProductModal() { document.getElementById('addProductModal').style.display = 'none'; }

async function submitNewProduct(e) {
    e.preventDefault();
    const body = {
        namaProduk: document.getElementById('p_nama').value,
        harga: document.getElementById('p_harga').value,
        stokKG: document.getElementById('p_stok').value,
        deskripsi: document.getElementById('p_deskripsi').value,
        filepath: document.getElementById('p_gambar').value
    };
    await fetch(`${API_URL}/admin/products`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    closeProductModal();
    loadProducts();
}

// =======================
// MODULE: ORDERS
// =======================
async function loadOrders() {
    try {
        const res = await fetch(`${API_URL}/admin/orders`);
        const result = await res.json();
        if(result.success) {
            const tbody = document.querySelector('.orders-table tbody');
            tbody.innerHTML = '';
            result.data.forEach(o => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${o.idPemesanan}</td>
                    <td>${o.namaDepan} ${o.namaBelakang || ''}</td>
                    <td>Rp ${formatCurrency(o.grandTotal)}</td>
                    <td>${o.Status}</td>
                    <td>
                        <select onchange="updateOrderStatus(${o.idPemesanan}, this.value)">
                            <option value="dipesan" ${o.Status=='dipesan'?'selected':''}>Dipesan</option>
                            <option value="diproses" ${o.Status=='diproses'?'selected':''}>Diproses</option>
                            <option value="dikirim" ${o.Status=='dikirim'?'selected':''}>Dikirim</option>
                            <option value="sukses" ${o.Status=='sukses'?'selected':''}>Sukses</option>
                            <option value="batal" ${o.Status=='batal'?'selected':''}>Batal</option>
                        </select>
                    </td>
                    <td><button class="btn-view" onclick="viewOrderDetail(${o.idPemesanan})">Detail</button></td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch(e) { console.error(e); }
}

async function updateOrderStatus(id, status) {
    await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status})
    });
    loadOrders();
}

async function viewOrderDetail(id) {
    const res = await fetch(`${API_URL}/admin/orders/${id}`);
    const result = await res.json();
    if(result.success) {
        const { order, items } = result.data;
        let itemsHtml = items.map(i => `<tr><td>${i.namaProduk}</td><td>${i.qtyPesanan}</td><td>${formatCurrency(i.subtotal)}</td></tr>`).join('');
        const html = `
            <h3>Order #${id}</h3>
            <p>Customer: ${order.namaDepan} (${order.no_telp})</p>
            <p>Alamat: ${order.alamat}</p>
            <table width="100%" border="1" style="border-collapse:collapse; margin-top:10px;">
                <tr><td>Produk</td><td>Qty</td><td>Subtotal</td></tr>
                ${itemsHtml}
            </table>
            <h4 style="text-align:right; margin-top:10px;">Total: Rp ${formatCurrency(order.grandTotal)}</h4>
        `;
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('orderModal').style.display = 'block';
    }
}
function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

// =======================
// MODULE: CUSTOMERS
// =======================
async function loadCustomers() {
    try {
        const res = await fetch(`${API_URL}/admin/customers`);
        const result = await res.json();
        if(result.success) {
            const tbody = document.querySelector('.customers-table tbody');
            tbody.innerHTML = '';
            result.data.forEach(c => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${c.namaDepan} ${c.namaBelakang||''}</td>
                    <td>${c.email}</td>
                    <td>${c.no_telp||'-'}</td>
                    <td>${c.alamat||'-'}</td>
                    <td><button class="btn-action delete" onclick="deleteUser(${c.idUser})"><i class="fas fa-trash"></i></button></td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch(e) { console.error(e); }
}

// =======================
// MODULE: USERS
// =======================
async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}/admin/users`);
        const result = await res.json();
        if(result.success) {
            const tbody = document.querySelector('.users-table tbody');
            tbody.innerHTML = '';
            result.data.forEach(u => {
                const row = document.createElement('tr');
                const data = encodeURIComponent(JSON.stringify(u));
                row.innerHTML = `
                    <td>${u.idUser}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        <button class="btn-action edit" onclick="editUser('${data}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" onclick="deleteUser(${u.idUser})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch(e) { console.error(e); }
}

function openUserModal(data = null) {
    const form = document.getElementById('userForm');
    form.reset();
    if(data) {
        document.getElementById('userModalTitle').innerText = 'Edit Akun';
        document.getElementById('u_id').value = data.idUser;
        document.getElementById('u_username').value = data.username;
        document.getElementById('u_username').disabled = true;
        document.getElementById('u_email').value = data.email;
        document.getElementById('u_role').value = data.role;
        document.getElementById('u_password').required = false;
        document.getElementById('passHelp').innerText = '*Kosongkan jika password tetap';
    } else {
        document.getElementById('userModalTitle').innerText = 'Tambah Akun';
        document.getElementById('u_id').value = '';
        document.getElementById('u_username').disabled = false;
        document.getElementById('u_password').required = true;
        document.getElementById('passHelp').innerText = '*Wajib diisi';
    }
    document.getElementById('userModal').style.display = 'block';
}
function closeUserModal() { document.getElementById('userModal').style.display = 'none'; }
function editUser(str) { openUserModal(JSON.parse(decodeURIComponent(str))); }

async function submitUser(e) {
    e.preventDefault();
    const id = document.getElementById('u_id').value;
    const body = {
        username: document.getElementById('u_username').value,
        email: document.getElementById('u_email').value,
        role: document.getElementById('u_role').value,
        password: document.getElementById('u_password').value
    };
    
    const url = id ? `${API_URL}/admin/users/${id}` : `${API_URL}/admin/users`;
    const method = id ? 'PUT' : 'POST';

    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
    closeUserModal();
    loadUsers();
    loadCustomers(); // Refresh customer juga in case email berubah
}

async function deleteUser(id) {
    if(confirm('Hapus user ini?')) {
        await fetch(`${API_URL}/admin/users/${id}`, {method: 'DELETE'});
        loadUsers();
        loadCustomers();
    }
}

// Helper
function logoutAdmin() {
    if(confirm('Logout?')) { localStorage.clear(); window.location.href='login.html'; }
}
function formatCurrency(val) { return new Intl.NumberFormat('id-ID').format(val); }

// Close modal on click outside
window.onclick = function(e) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(m => { if(e.target == m) m.style.display = "none"; });
}