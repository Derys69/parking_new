import { ref, push, set, onValue, update, remove } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db } from "../firebase-config.js";

export const addVehicle = async (plate, brand, type) => {
    const newRef = push(ref(db, 'vehicles'));
    await set(newRef, { plate: plate.toUpperCase(), brand, type, createdAt: Date.now() });
};

export const getVehicles = (callback) => {
    onValue(ref(db, 'vehicles'), snapshot => {
        const data = [];
        if(snapshot.exists()) {
            snapshot.forEach(child => data.push({ id: child.key, ...child.val() }));
        }
        callback(data);
    });
};

export const updateVehicle = async (id, updatedData) => {
    await update(ref(db, `vehicles/${id}`), updatedData);
};

export const deleteVehicle = async (id) => {
    await remove(ref(db, `vehicles/${id}`));
};