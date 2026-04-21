import { auth, db } from '../firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Login Route Protection
let isLoggingOut = false; 

export function setupAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            if (!isLoggingOut) {
                alert("Anda harus login terlebih dahulu!");
            }
            window.location.href = "login.html";
        } else {
            console.log("User terautentikasi: ", user.displayName || user.email);
                        
            get(ref(db, 'users/' + user.uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    
                    if (userData.role === 'admin') {
                        document.getElementById('adminOnly').style.display = 'block';
                        document.getElementById('memberOnly').style.display = 'none';
                        
                        document.getElementById('btnToggleHistory').style.display = 'inline-block'; 
                        
                    } else {
                        document.getElementById('adminOnly').style.display = 'none';
                        document.getElementById('memberOnly').style.display = 'block';
                        document.getElementById('btnToggleHistory').style.display = 'none'; 
                        document.getElementById('historySection').style.display = 'none'; 
                    }
                }
            });
        }
    });
}

// Logout
export function logoutUser() {
    isLoggingOut = true; 
    signOut(auth).then(() => {
        alert("Anda telah berhasil keluar.");
    }).catch((error) => {
        isLoggingOut = false; 
        alert("Gagal logout: " + error.message);
    });
}