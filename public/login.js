// Import the functions you need from the SDKs you need
import { auth, userDB, taskDB } from "./firebase.js";
import { createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         onAuthStateChanged,
        } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
// import { unsubscribeAllTasks } from "./index.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

// VALIDATE USER ACCESS AND CREATE PERSONAL LIST
async function validatePersonalList(user){
    const userSnap = await (get(ref(userDB, `users/${user.uid}`)));
    const userName = userSnap.val().userName;

    const listCol = collection(taskDB, "toDoList");
    const personalQuery = query(listCol, where("owner", "==", user.uid));
    const querySnapshot = await getDocs(personalQuery);

    if (querySnapshot.empty){
        const newPersonalList = await addDoc(listCol, {
            owner: user.uid,
            dateCreated: new Date().toISOString(),
            name: `${userName}'s Personal TDL`
        });
        console.log("Created personal list:", newPersonalList.id);
        return newPersonalList.id;
    } else {
        const existingList = querySnapshot.docs[0];
        console.log("Personal list exists:", existingList.id);
        return existingList.id;
    }
}

// CHECK IF USER IS LOGGED IN OR LOGGED OUT
async function checkUserAuthStatus() { 
    onAuthStateChanged(auth, async (user) => {
        if (user){
            const userSnap = await (get(ref(userDB, `users/${user.uid}`)));
            const userName = userSnap.val().userName;

            console.log(`${userName}`+" is logged in.");
            if (!window.location.href.includes("index.html")) {
                window.location.replace("index.html");
            }
        } else {
            signupBox.style.display = "none";
            loginBox.style.display = "flex";
        }
    });
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
            const userRecord = await get(ref(userDB, `users/${user.uid}`));
            const curUserData = userRecord.exists() ? userRecord.val() : null;
            const name = curUserData.userName;
            
            alert(`${name} log in successful!`);
            loginForm.reset(); 
            updateLogInButton();
            window.location.replace("index.html");

        
        } catch (error){
            if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
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
            
            
            await set(ref(userDB, `users/${user.uid}`),{
                userName,
                userEmail,
                createdAt : new Date().toISOString()
            });
            
            alert("Account created successfully! Logged in automatically!");
            signUpForm.reset();
            updateSignUpButton();
            await validatePersonalList(user);
            window.location.replace("index.html");  
            // await displayCurrentUserInfo(user);        

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