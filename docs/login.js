// Import the functions you need from the SDKs you need
import { auth, DB } from "./firebase_template.js";
import { createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         onAuthStateChanged,
        } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, query, where, getDocs, getDoc, addDoc, setDoc, doc} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

//DATABASES
const usersDB = collection(DB, 'users');
const toDoListsDB = collection(DB, 'toDoList');

//VARIABLES
let currentUserName = "";

//DOM REFERENCES
const loginBox = document.getElementById("login-container");
const signupBox = document.getElementById("signup-container");
const goToLogin = document.getElementById("go-to-login");
const goToSignup = document.getElementById("go-to-signup");
const toggleButtons = document.querySelectorAll('.toggle-password');

//GET LOGIN INPUT
const loginForm = document.getElementById("login-form");
const loginEmailInput = document.getElementById("login-email-input");
const loginPasswordInput = document.getElementById("login-password-input");
const loginBtn = document.getElementById("login-btn");

//GET SIGNUP INPUT
const signUpForm = document.getElementById("signup-form");
const signupNameInput = document.getElementById("signup-name-input");
const signupEmailInput = document.getElementById("signup-email-input");
const signupPasswordInput = document.getElementById("signup-password-input");
const signupConfirmPasswordInput = document.getElementById("signup-confirm-password-input");
const signupBtn = document.getElementById("signup-btn");


const params = new URLSearchParams(window.location.search);
if (params.get("msg") === "loggedout") {
    showToast("You have been logged out.");
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;

       if(type === "success") {
        toast.style.background = "#A8E6CF"; // pastel green
        toast.style.color = "#2D3E2F";      // dark enough for contrast
    } else { // error
        toast.style.background = "#FF8B94"; // pastel red
        toast.style.color = "#662626ff";      // dark red for contrast
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 5500);
}


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


function updateLogInButton () {
    if (loginEmailInput.value.trim() !== "" && loginPasswordInput.value.trim() !== ""){
        loginBtn.disabled = false;
        loginBtn.classList.add("enabled");
    } else {
        loginBtn.disabled = true;
        loginBtn.classList.remove("enabled");
    }
}


function updateSignUpButton () {
    if (signupNameInput.value.trim() !== "" && signupEmailInput.value.trim() !== "" && signupPasswordInput.value.trim() !== ""){
        signupBtn.disabled = false;
        signupBtn.classList.add("enabled");
    } else {
        signupBtn.disabled = true;
        signupBtn.classList.remove("enabled");
    }
}

// VALIDATE AND CREATE PERSONAL LIST
async function createOrValidatePersonalList(user){
    const personalQuery = query(toDoListsDB, where("owner", "==", user.uid));
    const personalQuerySnapshot = await getDocs(personalQuery);
    currentUserName = await fetchCurrentUserName(user);

    if (personalQuerySnapshot.empty){
        const toDoListToAdd = {
            owner: user.uid,
            dateCreated: new Date().toISOString(),
            identifier: `${currentUserName}'s Personal TDL`
        }
        try {
            const newPersonalList = await addDoc(toDoListsDB, toDoListToAdd);
    
            return newPersonalList.id;
        } catch (addDocError) {
    
            throw addDocError; // Re-throw to be caught by processUserSignup's catch block
        }
    } else {
        const existingList = personalQuerySnapshot.docs[0];
        return existingList.id;
    }
}

async function fetchCurrentUserName(user) {
    const userDocRef = doc(usersDB, user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if(userDocSnap.exists()){
        const userData = userDocSnap.data();
        currentUserName = userData.name;
    }

    return currentUserName;

}
// CHECK IF USER IS LOGGED IN OR LOGGED OUT
async function checkUserAuthStatus() { 
    onAuthStateChanged(auth, async (user) => {
        if (user){
             currentUserName = await fetchCurrentUserName(user); 
            
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

goToLogin.addEventListener("click", () => {
    loginBox.style.display = "flex";
    signupBox.style.display = "none";
});

goToSignup.addEventListener("click", () => {
    loginBox.style.display = "none";
    signupBox.style.display = "flex";
});



function processUserLogin(){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const userEmail = loginEmailInput.value.trim();
        const userPassword = loginPasswordInput.value.trim();

        if (!userEmail || !userPassword) {
            showToast("Please enter both email and password.", "error");
            return;
        }
        loginBtn.disabled = true;
        try {
            const userLoginInfo = await signInWithEmailAndPassword(auth, userEmail, userPassword);

            // showToast(`${currentUserName} logged in successfully!`, "success");
           
            loginForm.reset(); 
            updateLogInButton();
            window.location.replace("index.html");
            // setTimeout(() => {
            //     window.location.replace("index.html");
            // }, 500);
    
        
        } catch (error){
            if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                showToast("Invalid credentials. Please check your email and password.", "error");
            } else if (error.code === "auth/user-not-found"){
                showToast("Email is not registered yet. Try signing up.", "error");
            } else {
                showToast("Error: " + error.message, "error");
            }
        }
        loginForm.reset();
  
    });
}


function processUserSignup(){
    signUpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const userName = signupNameInput.value.trim();
        const userEmail = signupEmailInput.value.trim();
        const userPassword = signupPasswordInput.value.trim();
        const userConfirmPassword = signupConfirmPasswordInput.value.trim();
        
        if (userPassword !== userConfirmPassword){
                showToast("Passwords do not match. Please check your password inputs carefully.", "error");
                return;
        }


        try{
            
            const userSignUpInfo = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
            const user = userSignUpInfo.user;
            
            const userToAdd = {
                name: userName,
                email: userEmail,
                dateCreated: new Date().toISOString()
            }
            await setDoc(doc(usersDB, user.uid), userToAdd);
           
            // showToast("Account created successfully! Logged in automatically!", "success");
            signUpForm.reset();
            updateSignUpButton();
            await createOrValidatePersonalList(user);
            window.location.replace("index.html");
            // setTimeout(() => { 
            //     window.location.replace("index.html");
            // }, 500);
      
    
        } catch (error){
           if (error.code === "auth/email-already-in-use") {
                showToast("That email is already registered. Try logging in instead.", "error");
            } else if (error.code === "auth/weak-password") {
                showToast("Password should be at least 6 characters.", "error");
            } else {
                showToast("Error: " + error.message, "error")
            }
        }
        
    });
}

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