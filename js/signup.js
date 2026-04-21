import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { app, db } from './firebase-config.js';

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
            
            await set(ref(db, 'users/' + user.uid), {
                name: name,
                email: email,
                role: 'member' 
            });

            await updateProfile(user, { displayName: name });            
            await sendEmailVerification(user);
            
            alert("Pendaftaran Berhasil! Silakan cek email Anda.");
            window.location.href = "login.html"; 
        })
        .catch((error) => alert("Gagal: " + error.message));
});