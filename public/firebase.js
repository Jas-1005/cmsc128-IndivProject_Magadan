// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
            apiKey: "AIzaSyDX2PT9q_Yx1PdPooSnKM2-K5cw4Z-1OnE",
            authDomain: "cmsc-128-fullstack.firebaseapp.com",
            projectId: "cmsc-128-fullstack",
            storageBucket: "cmsc-128-fullstack.firebasestorage.app",
            messagingSenderId: "726754132879",
            appId: "1:726754132879:web:9d28c52f5b9bdc13be01fa",
            measurementId: "G-CFCF9BFCMS",
            databaseURL: "https://cmsc-128-fullstack-default-rtdb.firebaseio.com"
        };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const userDB = getDatabase(app);
const taskDB = getFirestore(app);

console.log("Firebase initialized:", app);

export { auth, userDB, taskDB};