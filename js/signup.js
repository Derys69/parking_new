import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: name });            
            await sendEmailVerification(user);
            
            alert("Pendaftaran Berhasil! Link verifikasi telah dikirim ke " + email + ".\nSilakan check email Anda.");
            
            window.location.href = "login.html"; 
        })
        .catch((error) => {
            alert("Gagal mendaftar: " + error.message);
        });
});