import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                await signOut(auth); 
                alert("Akses Ditolak!\nEmail Anda belum diverifikasi. Silakan check email Anda.");
                return; 
            }

            alert("Login berhasil!");
            window.location.href = "index.html"; 
        })
        .catch((error) => {
            let pesanError = "Terjadi kesalahan.";
            
            if (error.code === 'auth/user-not-found') {
                pesanError = "Akun tidak ditemukan! Silakan daftar terlebih dahulu.";
            } else if (error.code === 'auth/wrong-password') {
                pesanError = "Password salah!";
            } else if (error.code === 'auth/invalid-credential') {
                pesanError = "Akun tidak ditemukan atau Password salah!";
            }
            
            alert(pesanError);
        });
});