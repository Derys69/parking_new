import { db } from './firebase-config.js';
import { 
    ref, push, set, onValue, update, remove, get, query, orderByChild, equalTo 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const parkingGrid = document.getElementById('parkingGrid');
const historyBody = document.getElementById('historyBody');
const btnCheckIn = document.getElementById('btnCheckIn');
const historySection = document.getElementById('historySection');
const inputSection = document.getElementById('inputSection'); 


const transactionsRef = ref(db, 'transactions');

// Query untuk data aktif
const qActive = query(transactionsRef, orderByChild('status'), equalTo('active'));

const auth = getAuth();

// Login Route Protection
let isLoggingOut = false; 

onAuthStateChanged(auth, (user) => {
    if (!user) {
        if (!isLoggingOut) {
            alert("Anda harus login terlebih dahulu!");
        }
        window.location.href = "login.html";
    } else {
        console.log("User terautentikasi: ", user.displayName || user.email);
    }
});

onValue(qActive, (snapshot) => {
    parkingGrid.innerHTML = '';
    const isHistoryOpen = historySection.style.display === 'block';
    
    let slotCounts = { A1: 0, A2: 0, B1: 0, B2: 0 };
    
    let activeData = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            activeData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        activeData.sort((a, b) => b.checkInTime - a.checkInTime);
    }

    activeData.forEach((data) => {
        // Hitung slot
        if (slotCounts[data.slot] !== undefined) {
            slotCounts[data.slot]++;
        }

        const div = document.createElement('div');
        div.className = "transaction-item";
        
        const timeString = data.checkInTime ? new Date(data.checkInTime).toLocaleTimeString('id-ID') : '...';

        div.innerHTML = `
            <div class="info">
                <strong>${data.plate}</strong>
                <span>Slot: ${data.slot} | Paket: ${data.type.toUpperCase()}</span>
                <small>Masuk: ${timeString}</small>
            </div>
            <button class="btn-out" onclick="handleCheckOut('${data.id}')">Check Out</button>
        `;
        
        if (!isHistoryOpen) {
            parkingGrid.style.display = 'flex';
            parkingGrid.appendChild(div);
        }
    });

    // Update teks Dropdown
    const slotSelect = document.getElementById('slotSelect');
    Array.from(slotSelect.options).forEach(option => {
        const area = option.value; 
        const count = slotCounts[area] || 0; 
        
        if (count >= 10) {
            option.innerText = `Area ${area} (PENUH)`;
            option.disabled = true; 
        } else {
            option.innerText = `Area ${area} (${count}/10)`;
            option.disabled = false;
        }
    });
});

//History
const qHistory = query(transactionsRef, orderByChild('status'), equalTo('completed'));

onValue(qHistory, (snapshot) => {
    historyBody.innerHTML = '';
    
    let historyData = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            historyData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        historyData.sort((a, b) => b.checkOutTime - a.checkOutTime);
    }

    historyData.forEach((data) => {
        const checkInStr = data.checkInTime ? new Date(data.checkInTime).toLocaleTimeString('id-ID') : '...';
        const checkOutStr = data.checkOutTime ? new Date(data.checkOutTime).toLocaleTimeString('id-ID') : '...';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${data.plate}</b></td>
            <td>${data.slot}</td>
            <td>${checkInStr}</td>
            <td>${checkOutStr}</td>
            <td class="cost-tag">Rp ${data.totalCost?.toLocaleString('id-ID')}</td>
            <td><button class="btn-delete-item" onclick="deleteHistoryItem('${data.id}')">X</button></td>
        `;
        historyBody.appendChild(tr);
    });
});

//Check-in
btnCheckIn.onclick = async () => {
    const plate = document.getElementById('plateNumber').value.toUpperCase();
    const slotId = document.getElementById('slotSelect').value;
    const packageType = document.getElementById('packageSelect').value;

    if(!plate) return alert("Isi plat nomor!");

    try {
        const snapSlot = await get(qActive);
        let currentCount = 0;
        if (snapSlot.exists()) {
            snapSlot.forEach(child => {
                if(child.val().slot === slotId) currentCount++;
            });
        }
        
        if (currentCount >= 10) { 
            return alert(`Maaf, Area ${slotId} sudah penuh (10/10)! Silakan pilih area lain.`);
        }

        const newTransactionRef = push(transactionsRef);
        await set(newTransactionRef, {
            plate, 
            slot: slotId, 
            type: packageType, 
            status: "active", 
            checkInTime: Date.now()
        });
        
        document.getElementById('plateNumber').value = '';
    } catch (e) {
        console.error("Error: ", e);
    }
};

//Check-out & Cetak Struk
window.handleCheckOut = async (id) => {
    if(!confirm("Proses Keluar & Cetak Struk?")) return;
    
    const docRef = ref(db, `transactions/${id}`);
    const snap = await get(docRef);
    if (!snap.exists()) return;

    const data = snap.val();

    const diffHrs = Math.ceil((Date.now() - data.checkInTime) / (1000 * 60 * 60));
    let total = data.type === 'harian' ? diffHrs * 5000 : (data.type === 'mingguan' ? 150000 : 500000);

    document.getElementById('receiptBody').innerHTML = `
        <div class="receipt-row"><span>Plat:</span> <b>${data.plate}</b></div>
        <div class="receipt-row"><span>Slot:</span> <b>${data.slot}</b></div>
        <div class="receipt-row"><span>Durasi:</span> <b>${diffHrs} Jam</b></div>
        <div class="receipt-row" style="font-size:18px; margin-top:10px;"><span>TOTAL:</span> <b>Rp ${total.toLocaleString('id-ID')}</b></div>
    `;
    document.getElementById('receiptHarga').style.display = 'block';
    
    await update(docRef, { 
        status: "completed", 
        checkOutTime: Date.now(), 
        totalCost: total 
    });
};

window.deleteHistoryItem = async (id) => {
    if (confirm("Hapus riwayat transaksi ini secara permanen?")) {
        await remove(ref(db, `transactions/${id}`));
    }
};

document.getElementById('btnClearAll').onclick = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus SEMUA riwayat transaksi?")) {
        const snap = await get(qHistory);
        if (snap.exists()) {
            const updates = {};
            snap.forEach(child => {
                updates[child.key] = null; 
            });
            await update(transactionsRef, updates);
            alert("Semua riwayat telah dihapus.");
        }
    }
};
document.getElementById('btnToggleHistory').onclick = () => {
    const isHidden = historySection.style.display === 'none';
    
    if (isHidden) {
        historySection.style.display = 'block';
        parkingGrid.style.display = 'none'; 
        inputSection.style.display = 'none'; 
        document.getElementById('btnToggleHistory').innerText = 'Tutup Riwayat';
    } else {
        historySection.style.display = 'none';
        parkingGrid.style.display = 'flex'; 
        inputSection.style.display = 'grid';
        document.getElementById('btnToggleHistory').innerText = 'Lihat Riwayat';
    }
};

window.closeHarga = () => document.getElementById('receiptHarga').style.display = 'none';

// Logout
window.handleLogout = () => {
    isLoggingOut = true; 
    
    signOut(auth).then(() => {
        alert("Anda telah berhasil keluar.");
    }).catch((error) => {
        isLoggingOut = false; 
        alert("Gagal logout: " + error.message);
    });
};