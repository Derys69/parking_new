import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            return updateProfile(user, {
                displayName: name
            }).then(() => {
                alert("Pendaftaran Berhasil! Selamat datang, " + name);
                window.location.href = "index.html"; 
            });
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert("Gagal mendaftar: " + errorMessage);
        });
});