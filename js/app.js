import { db } from './firebase-config.js';
import { ref, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { setupAuth, logoutUser } from './services/auth-service.js';
import { processCheckIn, processCheckOut, removeHistory } from './services/transaction-service.js';
import { addSlot, updateSlot, deleteSlot } from './services/slots.js';
import { addVehicle, getVehicles, updateVehicle, deleteVehicle } from './services/kendaraan.js';
import { renderActiveTransactions, renderSlotUI, renderHistoryTable, showReceipt, toggleHistoryUI, renderVehicleUI } from './services/ui-service.js';

setupAuth();

const transactionsRef = ref(db, 'transactions');
let globalSlotCounts = {};
onValue(transactionsRef, (snapshot) => {
    let activeData = [];
    let historyData = [];
    globalSlotCounts = {};

    if (snapshot.exists()) {
        snapshot.forEach((child) => {
            const data = { id: child.key, ...child.val() };

            if (data.status === 'active') {
                activeData.push(data);
                globalSlotCounts[data.slot] = (globalSlotCounts[data.slot] || 0) + 1;
            } else if (data.status === 'completed') {
                historyData.push(data);
            }
        });

        activeData.sort((a, b) => b.checkInTime - a.checkInTime);
        historyData.sort((a, b) => (b.checkOutTime || 0) - (a.checkOutTime || 0));
    }

    const isHistoryOpen = document.getElementById('historySection').style.display === 'block';

    renderActiveTransactions(activeData, isHistoryOpen);
    renderHistoryTable(historyData);

    get(ref(db, 'slots')).then(snap => {
        renderSlotUI(snap.val(), globalSlotCounts);
    });
});

onValue(ref(db, 'slots'), (snapshot) => {
    renderSlotUI(snapshot.val(), globalSlotCounts);
});

getVehicles((vehicles) => {
    renderVehicleUI(vehicles);
});
document.getElementById('btnCheckIn').onclick = () => {
    const plate = document.getElementById('plateNumber').value.toUpperCase();
    const slotId = document.getElementById('slotSelect').value;
    const packageType = document.getElementById('packageSelect').value;
    const vehicleType = document.getElementById('vehicleSelect') ? document.getElementById('vehicleSelect').value : 'Mobil';

    if(!plate) return alert("Isi plat nomor!");

    processCheckIn(plate, slotId, packageType, vehicleType, globalSlotCounts[slotId] || 0);
};

window.triggerCheckOut = (id) => {
    if(!confirm("Proses Keluar & Cetak Struk?")) return;
    processCheckOut(id, showReceipt);
};

window.triggerDeleteHistory = (id) => {
    if (confirm("Hapus riwayat permanen?")) removeHistory(id);
};

document.getElementById('btnClearAll').onclick = async () => {
    if (confirm("Hapus SEMUA riwayat transaksi?")) {
        const snap = await get(transactionsRef);
        if (snap.exists()) {
            const updates = {};
            snap.forEach(child => {
                if (child.val().status === 'completed') {
                    updates[child.key] = null;
                }
            });
            await update(transactionsRef, updates);
            alert("Semua riwayat dihapus.");
        }
    }
};

document.getElementById('btnToggleHistory').onclick = toggleHistoryUI;
window.closeHarga = () => document.getElementById('receiptHarga').style.display = 'none';

document.getElementById('btnLogout').onclick = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) logoutUser();
};

const btnSaveSlot = document.getElementById('btnSaveSlot');
if(btnSaveSlot) {
    btnSaveSlot.onclick = () => {
        const name = document.getElementById('newSlotName').value;
        const cap = document.getElementById('newSlotCapacity').value;
        if(name && cap) {
            addSlot(name, cap);
            document.getElementById('newSlotName').value = '';
            document.getElementById('newSlotCapacity').value = '';
        }
    };
}

window.triggerEditSlot = (id, oldName, oldCap) => {
    const newName = prompt("Nama Area Baru:", oldName);
    const newCap = prompt("Kapasitas Baru:", oldCap);
    if (newName && newCap) updateSlot(id, { name: newName, capacity: parseInt(newCap) });
};

window.triggerRemoveSlot = (id) => confirm("Hapus area ini?") && deleteSlot(id);

const btnSaveVeh = document.getElementById('btnSaveVeh');
if (btnSaveVeh) {
    btnSaveVeh.onclick = () => {
        const plate = document.getElementById('newVehPlate').value.toUpperCase();
        const type = document.getElementById('newVehType').value;
        if (plate) {
            addVehicle(plate, "-", type);
            document.getElementById('newVehPlate').value = '';
        } else {
            alert("Plat nomor tidak boleh kosong!");
        }
    };
}

window.triggerEditVehicle = (id, oldType) => {
    const newType = prompt(`Ubah tipe kendaraan (Ketik: Mobil atau Motor):`, oldType);
    if (newType === 'Mobil' || newType === 'Motor') {
        updateVehicle(id, { type: newType });
    } else if (newType) {
        alert("Tipe tidak valid! Harus 'Mobil' atau 'Motor'.");
    }
};

window.triggerRemoveVehicle = (id) => {
    if (confirm("Hapus kendaraan member ini?")) deleteVehicle(id);
};