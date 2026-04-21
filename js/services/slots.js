import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { app } from "../firebase-config.js"; 

const db = getDatabase(app);

export function addSlot(name, capacity) {
  push(ref(db, 'slots'), {
    name,
    capacity
  });
}
export function getSlots(callback) {
  onValue(ref(db, 'slots'), snapshot => {
    callback(snapshot.val());
  });
}
export function updateSlot(id, data) {
  update(ref(db, 'slots/' + id), data);
}
export function deleteSlot(id) {
  remove(ref(db, 'slots/' + id));
}