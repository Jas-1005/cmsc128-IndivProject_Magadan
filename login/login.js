// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         onAuthStateChanged,
         signOut, 
         updateProfile,
         sendPasswordResetEmail,
        } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
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
            measurementId: "G-CFCF9BFCMS"
        };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

console.log("Firebase initialized:", app);


const toggleButtons = document.querySelectorAll('.toggle-password');

toggleButtons.forEach(toggle => {
    const icon = toggle.querySelector('i');
    const passwordInput = toggle.previousElementSibling;

    toggle.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
});


// FOR LOGIN 
const loginEmailInput = document.getElementById("login-email-input");
const loginPasswordInput = document.getElementById("login-password-input");
const loginBtn = document.getElementById("login-btn");

function updateLogInButton () {
    console.log("Checking input:", loginEmailInput.value);
    if (loginEmailInput.value.trim() !== "" && loginPasswordInput.value.trim() !== ""){
        loginBtn.disabled = false;
        loginBtn.classList.add("enabled");
    } else {
        loginBtn.disabled = true;
        loginBtn.classList.remove("enabled");
    }
}


//FOR SIGNUP
const signupNameInput = document.getElementById("signup-name-input");
const signupEmailInput = document.getElementById("signup-email-input");
const signupPasswordInput = document.getElementById("signup-password-input");
const signupBtn = document.getElementById("signup-btn");

function updateSignUpButton () {
    console.log("Checking input:", signupNameInput.value);
    if (signupNameInput.value.trim() !== "" && signupEmailInput.value.trim() !== "" && signupPasswordInput.value.trim() !== ""){
        signupBtn.disabled = false;
        signupBtn.classList.add("enabled");
    } else {
        signupBtn.disabled = true;
        signupBtn.classList.remove("enabled");
    }
}

//FOR LOG OUT
const userProfileBox = document.getElementById("edit-user-profile-form-container");
const logOutBtn = document.getElementById("logout-btn");

logOutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;

    const uid = currentUser.uid;
    
    try{
        const userRecord = await get(ref(database, `users/${uid}`));
        const curUserData = userRecord.val(); 
        const name = curUserData.userName;
        
        await signOut(auth);
        alert(`${name} logged out.`);
        
        checkUserAuthStatus();

    } catch (error){
        console.error(error);
    }
    
});


// CHECK IF USER IS LOGGED IN OR LOGGED OUT
async function checkUserAuthStatus() { 
    onAuthStateChanged(auth, async (user) => {
        if (user){
            console.log(`${user.displayName || user.email }`+" is logged in.");
            // alert("Login successfully! Welcome, " + (user.displayName||user.email));
            loginForm.reset();
            updateLogInButton();
            // await user.reload();
            await displayCurrentUserInfo(user);
        } else {
            // console.log(`${user.displayName || user.email}`+" is logged out.");
            // console.log("log out here");
            userProfileBox.style.display = "none";
            signupBox.style.display = "none";
            loginBox.style.display = "flex";
        }

    });
}


//FOR UPDATING USER PROFILE
const curUserWelcomeMessage = document.getElementById("edit-user-profile-form-label");
const curUserNameInput = document.getElementById("edit-name-input"); 
const curUserEmailInput = document.getElementById("edit-email-input");
const saveEditBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-changes-btn");

async function displayCurrentUserInfo(user) {
    loginBox.style.display = "none";
    signupBox.style.display = "none";
    userProfileBox.style.display ="flex";

    try {
        const userRecord = await get(ref(database, `users/${user.uid}`));
        const curUserData = userRecord.exists() ? userRecord.val() : null;
        const name = user.displayName || curUserData?.userName;

        curUserWelcomeMessage.textContent = `Hello, ${name}!`;
        curUserNameInput.value = name;
        curUserEmailInput.value = user.email;

    } catch (error){
        console.log(error);
    }


}


//SWITCH BETWEEN LOGIN AND SIGNUP BOXES
const loginBox = document.getElementById("login-container");
const signupBox = document.getElementById("signup-container");
const goToLogin = document.getElementById("go-to-login");
const goToSignup = document.getElementById("go-to-signup");

goToLogin.addEventListener("click", () => {
    forgotPWContainer.style.display = "none";
    loginBox.style.display = "flex";
    signupBox.style.display = "none";

    
});

goToSignup.addEventListener("click", () => {
    loginBox.style.display = "none";
    signupBox.style.display = "flex";
});

//GET LOGIN INPUT
const loginForm = document.getElementById("login-form");

function processUserLogin(){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const userEmail = loginEmailInput.value.trim();
        const userPassword = loginPasswordInput.value.trim();
        
        console.log("User email: ", userEmail);
        console.log("User password: ", userPassword);

        loginBtn.disabled = true;
        try {
            const userLoginInfo = await signInWithEmailAndPassword(auth, userEmail, userPassword);
            const user = userLoginInfo.user;
            const userRecord = await get(ref(database, `users/${user.uid}`));
            const curUserData = userRecord.exists() ? userRecord.val() : null;
            const name = user.displayName || curUserData?.userName;
            
            alert(`${name} log in successful!`);
            checkUserAuthStatus();

        
        } catch (error){
            if (error.code === "auth/user-not-found" || "auth/invalid-credential") {
            alert("No account found with that email.");
            } else if (error.code === "auth/wrong-password") {
            alert("Incorrect password. Please try again.");
            } else if (error.code === "auth/invalid-email") {
            alert("Please enter a valid email address.");
            } else {
            alert("Error: " + error.message);
            }
            console.error(error);
        }
        loginForm.reset();
  
    });
}

//GET SIGNUP INPUT
const signUpForm = document.getElementById("signup-form");

function processUserSignup(){
    signUpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const userName = signupNameInput.value.trim();
        const userEmail = signupEmailInput.value.trim();
        const userPassword = signupPasswordInput.value.trim();
        
        console.log("User name: ", userName);
        console.log("User email: ", userEmail);
        console.log("User password: ", userPassword);
        
        try{
            const userSignUpInfo = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
            const user = userSignUpInfo.user;
            
            
            await set(ref(database, `users/${user.uid}`),{
                userName,
                userEmail,
                createdAt : new Date().toISOString()
            });
            
            await updateProfile(user, {displayName : userName});
            
            alert("Account created successfully! Logged in automatically!");
            signUpForm.reset();
            updateSignUpButton();  
            await displayCurrentUserInfo(user);        

        } catch (error){
           if (error.code === "auth/email-already-in-use") {
                alert("That email is already registered. Try logging in instead.");
            } else if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");
            } else if (error.code === "auth/weak-password") {
                alert("Password should be at least 6 characters.");
            } else {
                alert("Error: " + error.message);
            }
            console.error(error);
        }
        
    });
}

//FORGET PASSWORD
const forgotPWBtn = document.getElementById("forget-password-text");
const forgotPWContainer = document.getElementById("forget-password-container");

forgotPWBtn.addEventListener("click", () => {
    loginBox.style.display = "none";
    forgotPWContainer.style.display = "flex";
});



loginEmailInput.addEventListener("input", updateLogInButton);
loginPasswordInput.addEventListener("input", updateLogInButton);
updateLogInButton();


signupNameInput.addEventListener("input", updateSignUpButton);
signupEmailInput.addEventListener("input", updateSignUpButton);
signupPasswordInput.addEventListener("input", updateSignUpButton);
updateSignUpButton();

processUserLogin();
processUserSignup();
checkUserAuthStatus();