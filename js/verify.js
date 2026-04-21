import { applyActionCode } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from './firebase-config.js'; 

const urlParams = new URLSearchParams(window.location.search);
const oobCode = urlParams.get('oobCode');
const mode = urlParams.get('mode');


if (mode === 'verifyEmail' && oobCode) {
    applyActionCode(auth, oobCode)
        .then(() => {
            alert("Email berhasil diverifikasi! Silakan login untuk melanjutkan.");

            window.location.replace("login.html"); 
        })
        .catch((error) => {
            alert("Gagal memverifikasi: Link mungkin sudah kadaluarsa atau tidak valid.");
            window.location.replace("login.html");
        });
} else {

    window.location.replace("login.html");
}