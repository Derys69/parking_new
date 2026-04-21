import { db } from '../firebase-config.js'; 
import { ref, push, set, update, remove, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const transactionsRef = ref(db, 'transactions');

// Fungsi untuk proses Check-in
export async function processCheckIn(plate, slotId, packageType, vehicleType, currentCount) {
    try {
        const snapSlots = await get(ref(db, 'slots'));
        let capacity = 10; 

        if (snapSlots.exists()) {
            const slotsData = snapSlots.val();
            const arraySlots = Object.values(slotsData);
            const found = arraySlots.find(s => s.name === slotId);
            if (found) capacity = found.capacity;
        }

        if (currentCount >= capacity) { 
            return alert(`Maaf, Area ${slotId} sudah penuh! Silakan pilih area lain.`);
        }

        const newTransactionRef = push(transactionsRef);
        await set(newTransactionRef, {
            plate, 
            slot: slotId, 
            type: packageType, 
            vehicleType: vehicleType, 
            status: "active", 
            checkInTime: Date.now()
        });
        
        document.getElementById('plateNumber').value = '';
    } catch (e) {
        console.error("Error: ", e);
    }
}

// Fungsi untuk proses Check-out & Hitung Tarif
export async function processCheckOut(id, onReceiptGenerated) {
    const docRef = ref(db, `transactions/${id}`);
    const snap = await get(docRef);
    if (!snap.exists()) return;

    const data = snap.val();

    // Logika Tarif & Denda
    const diffHrs = Math.max(1, Math.ceil((Date.now() - data.checkInTime) / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHrs / 24);
    
    let total = 0;
    let denda = 0;
    const isMobil = (data.vehicleType === 'Mobil' || !data.vehicleType);
    
    if (data.type === 'harian') {
        total = diffHrs * (isMobil ? 5000 : 2000);
        if (diffDays >= 1) denda = diffDays * 20000;
    } else if (data.type === 'bulanan') {
        total = isMobil ? 150000 : 50000;
        if (diffDays > 30) denda = (diffDays - 30) * 5000;
    } else {
        total = isMobil ? 150000 : 50000;
    }

    // Panggil fungsi callback untuk menampilkan UI Struk
    onReceiptGenerated(data, diffHrs, total, denda);

    await update(docRef, { 
        status: "completed", 
        checkOutTime: Date.now(), 
        totalCost: total,
        denda: denda
    });
}

// Fungsi Hapus History
export async function removeHistory(id) {
    await remove(ref(db, `transactions/${id}`));
}

export async function clearAllHistory(qHistory) {
    const snap = await get(qHistory);
    if (snap.exists()) {
        const updates = {};
        snap.forEach(child => {
            updates[child.key] = null; 
        });
        await update(transactionsRef, updates);
    }
}