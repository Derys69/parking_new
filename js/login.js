import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

            const user = userCredential.user;
            alert("Login berhasil!");
            window.location.href = "index.html"; 
        })
        .catch((error) => {
            let pesanError = "Terjadi kesalahan.";
            if (error.code === 'auth/invalid-credential') {
                pesanError = "Email atau Password salah!";
            }
            alert(pesanError);
        });
});