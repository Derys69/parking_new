import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyABj9FzE0Kl_E-6aByT8_ZEHZCfoLFEVms",
  authDomain: "asda-6af8d.firebaseapp.com",
  databaseURL: "https://asda-6af8d-default-rtdb.firebaseio.com",
  projectId: "asda-6af8d",
  storageBucket: "asda-6af8d.firebasestorage.app",
  messagingSenderId: "943686682616",
  appId: "1:943686682616:web:9ae17debba963520eaf80d",
  measurementId: "G-WYMBBDFX09"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);