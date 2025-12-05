// FIRESTORE
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, DB} from './firebase.js';
import { collection, doc, getDocs, getDoc, onSnapshot, query, where, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// DOM REFERENCES

//DATABASES
const usersDB = collection(DB, 'users');
const toDoListsDB = collection(DB, 'toDoList');


// LOCAL STATES OF DATA BEFORE UPDATE
let userTasks = null;
let currentTDListID = null;
let unsubscribeAllTasks = [];
let currentSort = "date added";
let currentUserName = "";
let currentTDListIdentifier = "";
// let currentUser = null;

// INPUTS 
const addTaskTextInput = document.getElementById("task-input");
const addTaskDueDateInput = document.getElementById("task-date-input");
const addTaskDueTimeInput = document.getElementById("task-time-input");
const addTaskDueTimeLabel = document.getElementById("task-time-label")
const taskPriorityInput = document.getElementById("priority-select");
const sorterSelect = document.getElementById("sorter-select");


// BUTTONS
const addBtn = document.getElementById("add-button");
const logOutBtn = document.getElementById("logout-button");


// CONTAINERS
const taskForm = document.getElementById("task-form");
const emptyModal = document.getElementById("empty-modal-list");
const taskContainer = document.querySelector(".task-item-container");
const mainContainer = document.getElementById("main-container");
const headerContainer = document.getElementById("header-container");

//USER AVATAR
const userAvatarBox = document.getElementById("avatar-full-name");


mainContainer.style.display = "none";
headerContainer.style.display = "none";

// BACKEND FUNCTIONS
onAuthStateChanged(auth, async (user) => {
        if (user){
            currentTDListIdentifier = await fetchCurrentUserName(user);
            setUserAvatar(currentTDListIdentifier);
            await loadTasksFromDB(user);
            processUserAddTask();
            updateAddButton();

            mainContainer.style.display = "block";
            headerContainer.style.display = "flex";

        } else {
            window.location.replace("login.html");
        }
});


async function fetchCurrentUserName(user) {
    const userDocRef = doc(usersDB, user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if(userDocSnap.exists()){
        const userData = userDocSnap.data();
        currentUserName = userData.name;
    }

    return currentUserName;

}

const loadTasksFromDB = async (user) => {
    //clear previous lsteners
    unsubscribeAllTasks.forEach(unsub => unsub());
    unsubscribeAllTasks = [];

    // personal list
    const userTDListQuery = query (toDoListsDB, where("owner","==", user.uid));
    const ownerSnap = await getDocs(userTDListQuery);
    const userAllTDLists = ownerSnap.docs;

    if (userAllTDLists.length === 0){
        try {
            currentUserName = await fetchCurrentUserName(user);

            const newListToAdd = {
                owner: user.uid,
                dateCreated: new Date().toISOString(),
                identifier: `${currentUserName}'s Personal TDL`
            };

            const newListRef = await addDoc(toDoListsDB, newListToAdd);

            currentTDListID = newListRef.id;
            userTasks = collection(toDoListsDB, currentTDListID, "tasks");

            const unsubscribe = onSnapshot(userTasks, snapshot => {
                taskContainer.innerHTML = "";
                snapshot.docs.forEach(taskDoc => addTaskToUI({id: taskDoc.id, ...taskDoc.data(), listID: currentTDListID }));
                toggleEmptyModal();
                sortTasksBy(currentSort);
            });
            unsubscribeAllTasks.push(unsubscribe);
            return;
        } catch (err) {
            console.error("Failed to create personal to-do list:", err);
            toggleEmptyModal();
            return;
        }
    } else {
          currentTDListID = userAllTDLists[0].id;
    }

    userTasks = collection(toDoListsDB, currentTDListID, "tasks");
    const unsubscribe = onSnapshot(userTasks, snapshot => {
        taskContainer.innerHTML = "";
        snapshot.docs.forEach(taskDoc => 
            addTaskToUI({id: taskDoc.id, ...taskDoc.data(), listID: currentTDListID})
        );
        toggleEmptyModal();
        sortTasksBy(currentSort);
    });
    unsubscribeAllTasks.push(unsubscribe);
};

//FOR LOG OUT
//const userProfileBox = document.getElementById("edit-user-profile-form-container");
logOutBtn.addEventListener("click", async (e) => {
    e.preventDefault();    
    try{
        unsubscribeAllTasks.forEach(unsub => unsub());
        unsubscribeAllTasks = [];

        const currentUser = auth.currentUser;
        currentUserName = await fetchCurrentUserName(currentUser)
        
        await signOut(auth);
        window.location.replace("login.html?msg=loggedout");

        
        await checkUserAuthStatus();

    } catch (error){
        // console.error(error);
    }
    
});

const toggleTaskDoneOnDB = async (taskID, doneStatus) => {
    try {
        const doneTask = doc(toDoListsDB, currentTDListID, "tasks", taskID);
        await updateDoc(doneTask, {done: doneStatus, dateUpdated: new Date().toISOString()});
        return {id: taskID, done:doneStatus};
    } catch (err) {
        // console.error("Failed to update done status:", err);
    }
};

function setUserAvatar(userName){
    userAvatarBox.textContent = `${userName}'s To-Do List`;
}

sorterSelect.addEventListener("change", () => {
    currentSort = sorterSelect.value.toLowerCase(); // "date added", "due date", "priority"
    sortTasksBy(currentSort);
});

function sortTasksBy(criteria) {
    // console.log("Sorting tasks by:", criteria);
    const taskContainer = document.querySelector(".task-item-container");
    const tasks = Array.from(taskContainer.children);

    // console.log("Before sort:");
    // tasks.forEach(task => {
    //     console.log(`Task: ${task.dataset.taskText}, Date Created: ${task.dataset.dateCreated}, Due: ${task.dataset.dueDate} ${task.dataset.dueTime}, Priority: ${task.dataset.priority}`);
    // });

    tasks.sort((a, b) => {
        if (criteria === "date added") {
            return new Date(a.dataset.dateCreated) - new Date(b.dataset.dateCreated);
        } else if (criteria === "due date") {
            const aDue = a.dataset.dueDate ? new Date(`${a.dataset.dueDate}T${a.dataset.dueTime || "00:00"}`) : new Date(8640000000000000); // far future if no date
            const bDue = b.dataset.dueDate ? new Date(`${b.dataset.dueDate}T${b.dataset.dueTime || "00:00"}`) : new Date(8640000000000000);
            return aDue - bDue;
        } else if (criteria === "priority") {
            const priorityOrder = { low: 1, mid: 2, high: 3 };
            const diff = priorityOrder[b.dataset.priority.toLowerCase()] - priorityOrder[a.dataset.priority.toLowerCase()];
        
            if (diff !== 0) return diff; // if   priorities are different, use priority
            
            // If priorities are the same, compare by due date
            const aDue = a.dataset.dueDate ? new Date(`${a.dataset.dueDate}T${a.dataset.dueTime || "00:00"}`) : new Date(8640000000000000);
            const bDue = b.dataset.dueDate ? new Date(`${b.dataset.dueDate}T${b.dataset.dueTime || "00:00"}`) : new Date(8640000000000000);
            return aDue - bDue;
        }
    });

    taskContainer.innerHTML = "";
    tasks.forEach(task => taskContainer.appendChild(task));

    // console.log("After sort:");
    // tasks.forEach(task => {
    //     console.log(`Task: ${task.dataset.taskText}, Date Created: ${task.dataset.dateCreated}, Due: ${task.dataset.dueDate} ${task.dataset.dueTime}, Priority: ${task.dataset.priority}`);
    // });
}

function updateAddButton () {
    // console.log("Checking input:", addTaskTextInput.value);
    if (addTaskTextInput.value.trim() !== "" && userTasks){
        addBtn.disabled = false;
        addBtn.classList.add("enabled");
    } else {
        addBtn.disabled = true;
        addBtn.classList.remove("enabled");
    }
}

function toggleEmptyModal() {
    if (taskContainer.children.length === 0) {
        emptyModal.style.display = "flex"; // show message
    } else {
        emptyModal.style.display = "none"; // hide message
    }
}


function showTimePicker(){
    addTaskDueDateInput.addEventListener("input", () => {
         if(addTaskDueDateInput.value){
            addTaskDueTimeInput.style.display = "inline-block";
            addTaskDueTimeLabel.style.display = "flex";
            updateTimeMin();
        } else {
            addTaskDueTimeInput.style.display = "none";
            addTaskDueTimeLabel.style.display = "none";
            addTaskDueTimeInput.value ="";
        }
    }); 
}

function validateDateTimePickers(){
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    addTaskDueDateInput.min = today;

    addTaskDueDateInput.addEventListener("change", updateTimeMin);

    // Run once on load
    updateTimeMin();
}

function updateTimeMin() {
    if (!addTaskDueDateInput.value) return;

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const selectedDateStr = addTaskDueDateInput.value;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    if (selectedDateStr === todayStr) {
        // If selected date is today, min time is current time
        addTaskDueTimeInput.min = `${hours}:${minutes}`;

        // If previously entered time is already past, clear it
        if (addTaskDueTimeInput.value && addTaskDueTimeInput.value < addTaskDueTimeInput.min) {
            addTaskDueTimeInput.value = "";
        }
    } else {
        // If selected date is in the future, allow all times
        addTaskDueTimeInput.min = "00:00";
    }
}

function processUserAddTask(){
    addTaskTextInput.addEventListener("input", updateAddButton);
    taskForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        try {
            const taskToAdd = {
                taskContent: addTaskTextInput.value.trim(),
                dueDate: addTaskDueDateInput.value || null,
                dueTime: addTaskDueTimeInput.value || null,
                priority: taskPriorityInput.value || "low",
                done: false,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString()
            }

            // console.log("Task to save: ", taskToAdd);
            const taskDocToAdd = await addDoc(userTasks, taskToAdd);

            taskForm.reset();
            updateAddButton();
            
            addTaskDueTimeInput.style.display = "none";
            addTaskDueTimeLabel.style.display = "none";

        } catch(err){
            // console.error("Error adding task:", err);
            return null;
        }
    });
}

function formatDateCreatedDisplay(date){
    return new Date(date).toLocaleDateString(undefined,{
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true    
    });
}

function formatDueDateDisplay(dateStr, timeStr) {
    if (!dateStr) return "No due date";

    const date = new Date(`${dateStr}T${timeStr || "00:00"}`);
    const options = {
        month: "short",    // Oct
        day: "numeric",    // 5
        year: "numeric",   // 2012
        weekday: "long"    // Friday
    };

    const formattedDate = date.toLocaleDateString(undefined, options);

    if (timeStr) {
        const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };
        const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
        return `${formattedDate} at ${formattedTime}`;
    } else {
        return formattedDate;
    }
}


function addTaskToUI(taskToAdd){
    // this is the parent container
    const taskList = document.querySelector(".task-item-container");
    
    //wrapper for one task
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task-item");
    taskDiv.dataset.id = taskToAdd.id;

    taskDiv.innerHTML = `
        <div class="done-action">
            <button class="done-btn`+ (taskToAdd.done ? " done" : "") +`"></button>
        </div>

        <div class="task-item-content">
            <h4 class="`+ (taskToAdd.done ? "done-task" : "") +`">${taskToAdd.taskContent}</h4>
        </div>
        
        <div class="task-item-date-added">
            <small>${formatDateCreatedDisplay(taskToAdd.dateCreated)}</small>
        </div>

        <div class="task-item-duedate">
            <small>${formatDueDateDisplay(taskToAdd.dueDate, taskToAdd.dueTime)}</small>
        </div>
        
        <div class="task-item-priority">
            <span>${taskToAdd.priority}</span>
        </div>
        <div class="task-item-actions">
            <button class="edit-btn `+ (taskToAdd.done ? "disabled" : "") +`">EDIT</button>
            <button class="delete-btn">DELETE</button>
        </div>
    `;

    // store the task info for easy editing later
    taskDiv.dataset.taskText = taskToAdd.taskContent;
    taskDiv.dataset.dateCreated = new Date(taskToAdd.dateCreated).toISOString();
    taskDiv.querySelector(".task-item-date-added small").textContent =
    formatDateCreatedDisplay(taskToAdd.dateCreated); //

    taskDiv.dataset.dueDate = taskToAdd.dueDate || "";
    taskDiv.dataset.dueTime = taskToAdd.dueTime || "";
    taskDiv.dataset.priority = taskToAdd.priority;
    taskDiv.dataset.done = taskToAdd.done;

    // attach to parent
    taskList.appendChild(taskDiv);

    //BUTTONS
    const doneBtn = taskDiv.querySelector(".done-btn");
    const editBtn = taskDiv.querySelector(".edit-btn");
    const deleteBtn = taskDiv.querySelector(".delete-btn"); 
    const taskText = taskDiv.querySelector("h4");

    //DELETE CONFIRMATION MODAL + BUTTONS
    const deleteConfirmationModal = document.getElementById("delete-modal");
    const confirmDelBtn = document.getElementById("confirm-delete-btn");
    const cancelDelBtn = document.getElementById("cancel-delete-btn");


    //EDIT MODAL
    const editModal = document.getElementById("edit-modal");
    const editTaskInput = document.getElementById("emodal-task-input");

    //EDIT MODAL BUTTONS
    const saveChangesBtn = document.getElementById("emodal-save-edit-button");
    const cancelEmodalBtn = document.getElementById("emodal-cancel-button");

    //FOR DONE BUTTON
    doneBtn.addEventListener("click", async () => {
        const newDoneStatus = !doneBtn.classList.contains("done");
        // Toggle green circle + checkmark
        doneBtn.classList.toggle("done");

        // Optionally, strike through the task text
        if (doneBtn.classList.contains("done")) {
            taskText.style.textDecoration = "line-through";
            taskText.style.color = "gray";

            editBtn.disabled = true;
            editBtn.style.opacity = 0.5;  // optional: visually show it’s disabled
            deleteBtn.disabled = false;    // keep delete usable
            deleteBtn.style.opacity = 1;

        } else {
            taskText.style.textDecoration = "none";
            taskText.style.color = "black";

            editBtn.disabled = false;
            editBtn.style.opacity = 1;
        }

        // Send update to backend
        await toggleTaskDoneOnDB(taskDiv.dataset.id, newDoneStatus);
    });

    //FOR DELETE BUTTON
    let taskToDelete = null;
    deleteBtn.addEventListener("click", () =>{  
        // console.log("Delete button clicked for task:", taskDiv.dataset.id);      
        deleteConfirmationModal.style.display = "flex";
        taskToDelete = taskDiv;
    });

    confirmDelBtn.addEventListener("click", async () => {
        // console.log("Confirm delete clicked");
        if (taskToDelete){
            const taskDocToDelete = doc(toDoListsDB, currentTDListID, "tasks", taskToDelete.dataset.id);

            try{
                await deleteDoc(taskDocToDelete);
                // console.log("Removing task from DOM");
                taskToDelete.remove();
                sortTasksBy(currentSort);
                toggleEmptyModal();
            }  catch (err) {
                // console.log("Backend deletion failed, not removing from DOM");
            }

        } else {
        // console.log("No task selected for deletion");
    }
        deleteConfirmationModal.style.display = "none";
        taskToDelete = null;
    });

    cancelDelBtn.addEventListener("click", () => {
        // console.log("Cancel delete clicked");
        deleteConfirmationModal.style.display = "none";
        taskToDelete = null;
    });


    //FOR EDIT BUTTON
    //const taskFormListContainer = document.querySelector(".task-form-list-container");
    
    let taskToEdit = null
    editBtn.addEventListener("click", () => {
        
        editModal.style.display = "flex";
        document.getElementById("task-form").classList.add("disabled");
        document.getElementById("task-sorter").classList.add("disabled");
        document.querySelector(".task-list").classList.add("disabled");

        editTaskInput.value = taskDiv.dataset.taskText;

        //set task text
        taskToEdit = taskDiv;
        document.getElementById("emodal-select").value = taskDiv.dataset.priority.toLowerCase();
        document.getElementById("emodal-date-input").value = taskDiv.dataset.dueDate;
        document.getElementById("emodal-time-input").value = taskDiv.dataset.dueTime;
        

         // Set date created
        const dateCreated = new Date(taskDiv.dataset.dateCreated);
        document.getElementById("emodal-date-created-text").textContent =
        dateCreated.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    })

    saveChangesBtn.addEventListener("click", async () => {
        if (!taskToEdit) return;
        
        const newText = editTaskInput.value.trim();
        const newPriority = document.getElementById("emodal-select").value;
        const newDueDate = document.getElementById("emodal-date-input").value || "";
        const newDueTime = document.getElementById("emodal-time-input").value || "";

        const updatedTaskInfo = {
            taskContent: newText,
            dueDate: newDueDate,
            dueTime: newDueTime,
            priority: newPriority,
            dateUpdated: new Date().toISOString()
        };

        const taskDocToEdit = doc(toDoListsDB, currentTDListID, "tasks", taskToEdit.dataset.id);
        
        try {
            await updateDoc(taskDocToEdit, updatedTaskInfo);
        } catch (err){
            // console.log("Backend edit failed, not editing from DOM");
        }
        
        // Update dataset
        taskToEdit.dataset.taskText = newText;
        taskToEdit.dataset.priority = newPriority;
        taskToEdit.dataset.dueDate = newDueDate ;
        taskToEdit.dataset.dueTime = newDueTime ;
        
        // Update the visible UI
        taskToEdit.querySelector("h4").textContent = newText;
        taskToEdit.querySelector(".task-item-priority span").textContent = newPriority;
        taskToEdit.querySelector(".task-item-duedate small").textContent =
        formatDueDateDisplay(newDueDate, newDueTime);

        sortTasksBy(currentSort);
        editModal.style.display = "none";
        document.getElementById("task-form").classList.remove("disabled");
        document.getElementById("task-sorter").classList.remove("disabled");
        document.querySelector(".task-list").classList.remove("disabled");
        taskToEdit = null; //clear reference


    });
    
    cancelEmodalBtn.addEventListener("click", () => {
        editModal.style.display = "none";
        document.getElementById("task-form").classList.remove("disabled");
        document.getElementById("task-sorter").classList.remove("disabled");
        document.querySelector(".task-list").classList.remove("disabled");
        taskToEdit = null;
    });
}


showTimePicker();
validateDateTimePickers();
toggleEmptyModal();