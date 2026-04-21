export function renderActiveTransactions(activeData, isHistoryOpen) {
    const parkingGrid = document.getElementById('parkingGrid');
    parkingGrid.innerHTML = '';

    activeData.forEach((data) => {
        const div = document.createElement('div');
        div.className = "transaction-item";
        const timeString = data.checkInTime ? new Date(data.checkInTime).toLocaleTimeString('id-ID') : '...';

        div.innerHTML = `
            <div class="info">
                <strong>${data.plate} (${data.vehicleType || 'Mobil'})</strong>
                <span>Slot: ${data.slot} | Paket: ${data.type.toUpperCase()}</span>
                <small>Masuk: ${timeString}</small>
            </div>
            <button class="btn-out" onclick="window.triggerCheckOut('${data.id}')">Check Out</button>
        `;
        
        parkingGrid.appendChild(div);
    });

    parkingGrid.style.display = isHistoryOpen ? 'none' : 'flex';
}

export function renderSlotUI(slots, slotCounts) {
    const slotSelect = document.getElementById('slotSelect');
    const slotTableBody = document.getElementById('slotTableBody');

    if (slotSelect) slotSelect.innerHTML = "";
    if (slotTableBody) slotTableBody.innerHTML = "";

    if (slots) {
        Object.keys(slots).forEach((id) => {
            const item = slots[id];
            const count = slotCounts[item.name] || 0; 
            
            if (slotSelect) {
                const option = document.createElement('option');
                option.value = item.name;
                if (count >= item.capacity) {
                    option.innerText = `Area ${item.name} (PENUH)`;
                    option.disabled = true; 
                } else {
                    option.innerText = `Area ${item.name} (${count}/${item.capacity})`;
                    option.disabled = false;
                }
                slotSelect.appendChild(option);
            }

            if (slotTableBody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.capacity}</td>
                    <td style="text-align: center;">
                        <button onclick="window.triggerEditSlot('${id}', '${item.name}', ${item.capacity})" style="background: #eab308; padding: 4px 8px; font-size: 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                        <button onclick="window.triggerRemoveSlot('${id}')" style="background: #ef4444; padding: 4px 8px; font-size: 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Hapus</button>
                    </td>
                `;
                slotTableBody.appendChild(tr);
            }
        });
    }
}

export function renderVehicleUI(vehicles) {
    const vehicleTableBody = document.getElementById('vehicleTableBody');
    if (vehicleTableBody) {
        vehicleTableBody.innerHTML = "";
        if (vehicles && vehicles.length > 0) {
            vehicles.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.plate}</td>
                    <td>${item.type}</td>
                    <td style="text-align: center;">
                        <button onclick="window.triggerEditVehicle('${item.id}', '${item.type}')" style="background: #eab308; padding: 4px 8px; font-size: 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                        <button onclick="window.triggerRemoveVehicle('${item.id}')" style="background: #ef4444; padding: 4px 8px; font-size: 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Hapus</button>
                    </td>
                `;
                vehicleTableBody.appendChild(tr);
            });
        }
    }
}

export function renderHistoryTable(historyData) {
    const historyBody = document.getElementById('historyBody');
    historyBody.innerHTML = '';

    historyData.forEach((data) => {
        const checkInStr = data.checkInTime ? new Date(data.checkInTime).toLocaleTimeString('id-ID') : '...';
        const checkOutStr = data.checkOutTime ? new Date(data.checkOutTime).toLocaleTimeString('id-ID') : '...';
        const denda = data.denda || 0;
        const totalDenganDenda = (data.totalCost || 0) + denda;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${data.plate}</b></td>
            <td>${data.slot}</td>
            <td>${checkInStr}</td>
            <td>${checkOutStr}</td>
            <td class="cost-tag">Rp ${totalDenganDenda.toLocaleString('id-ID')}</td>
            <td><button class="btn-delete-item" onclick="window.triggerDeleteHistory('${data.id}')">X</button></td>
        `;
        historyBody.appendChild(tr);
    });
}

export function showReceipt(data, diffHrs, total, denda) {
    document.getElementById('receiptBody').innerHTML = `
        <div class="receipt-row"><span>Plat:</span> <b>${data.plate}</b></div>
        <div class="receipt-row"><span>Slot:</span> <b>${data.slot}</b></div>
        <div class="receipt-row"><span>Durasi:</span> <b>${diffHrs} Jam</b></div>
        ${denda > 0 ? `<div class="receipt-row" style="color:red;"><span>Denda:</span> <b>Rp ${denda.toLocaleString('id-ID')}</b></div>` : ''}
        <div class="receipt-row" style="font-size:18px; margin-top:10px;"><span>TOTAL:</span> <b>Rp ${(total + denda).toLocaleString('id-ID')}</b></div>
    `;
    document.getElementById('receiptHarga').style.display = 'block';
}

export function toggleHistoryUI() {
    const historySection = document.getElementById('historySection');
    const parkingGrid = document.getElementById('parkingGrid');
    const inputSection = document.getElementById('inputSection');
    const btnToggle = document.getElementById('btnToggleHistory');

    const isHidden = historySection.style.display === 'none';
    if (isHidden) {
        historySection.style.display = 'block';
        parkingGrid.style.display = 'none'; 
        inputSection.style.display = 'none'; 
        btnToggle.innerText = 'Tutup Riwayat';
    } else {
        historySection.style.display = 'none';
        parkingGrid.style.display = 'flex'; 
        inputSection.style.display = 'grid';
        btnToggle.innerText = 'Lihat Riwayat';
    }
}