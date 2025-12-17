// Simpan file ini misal: generateHash.js
// Jalankan: node generateHash.js
const bcrypt = require('bcrypt'); 

async function makeHash() {
    const password = 'admin123'; // Password admin yg kamu mau
    const hash = await bcrypt.hash(password, 10);
    console.log('Copy hash ini ke database:', hash);
}

makeHash();