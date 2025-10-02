// INPUTS 
const addTaskTextInput = document.getElementById("task-input");
const addTaskDueDateInput = document.getElementById("task-date-input");
const addTaskDueTimeInput = document.getElementById("task-time-input");
const addTaskDueTimeLabel = document.getElementById("task-time-label")
const taskPriorityInput = document.getElementById("priority-select");
const sorterSelect = document.getElementById("sorter-select");

// BUTTONS
const addBtn = document.getElementById("add-button");

// CONTAINERS
const taskForm = document.getElementById("task-form");
const emptyModal = document.getElementById("empty-modal-list");
const taskContainer = document.querySelector(".task-item-container");


let currentSort = "date added";

sorterSelect.addEventListener("change", () => {
    currentSort = sorterSelect.value.toLowerCase(); // "date added", "due date", "priority"
    sortTasksBy(currentSort);
});

function sortTasksBy(criteria) {
    console.log("Sorting tasks by:", criteria);
    const taskContainer = document.querySelector(".task-item-container");
    const tasks = Array.from(taskContainer.children);

    console.log("Before sort:");
    tasks.forEach(task => {
        console.log(`Task: ${task.dataset.taskText}, Date Created: ${task.dataset.dateCreated}, Due: ${task.dataset.dueDate} ${task.dataset.dueTime}, Priority: ${task.dataset.priority}`);
    });


    tasks.sort((a, b) => {
        if (criteria === "date added") {
            return new Date(a.dataset.dateCreated) - new Date(b.dataset.dateCreated);
        } else if (criteria === "due date") {
            const aDue = a.dataset.dueDate ? new Date(`${a.dataset.dueDate}T${a.dataset.dueTime || "00:00"}`) : new Date(8640000000000000); // far future if no date
            const bDue = b.dataset.dueDate ? new Date(`${b.dataset.dueDate}T${b.dataset.dueTime || "00:00"}`) : new Date(8640000000000000);
            return aDue - bDue;
        } else if (criteria === "priority") {
            const priorityOrder = { low: 1, mid: 2, high: 3 };
            return priorityOrder[b.dataset.priority.toLowerCase()] - priorityOrder[a.dataset.priority];
        }
    });

    // Clear container and append sorted tasks
    taskContainer.innerHTML = "";
    tasks.forEach(task => taskContainer.appendChild(task));

    console.log("After sort:");
    tasks.forEach(task => {
        console.log(`Task: ${task.dataset.taskText}, Date Created: ${task.dataset.dateCreated}, Due: ${task.dataset.dueDate} ${task.dataset.dueTime}, Priority: ${task.dataset.priority}`);
    });
}


function updateAddButton () {
    console.log("Checking input:", addTaskTextInput.value);
    if (addTaskTextInput.value.trim() !== ""){
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
    taskForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const taskInfo = {
            task: addTaskTextInput.value.trim(),
            dueDate: addTaskDueDateInput.value || null,
            dueTime: addTaskDueTimeInput.value || null,
            priority: taskPriorityInput.value,
            done: false,
        };
        
        console.log("Task to save: ", taskInfo);

        const taskToAdd = await addTaskToBackend(taskInfo);

        if(taskToAdd){
            addTaskToUI(taskToAdd);
            sortTasksBy(currentSort);
            toggleEmptyModal();
        };

        taskForm.reset();
        updateAddButton();
        
        addTaskDueTimeInput.style.display = "none";
        addTaskDueTimeLabel.style.display = "none";
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
            <button class="done-btn"></button>
        </div>

        <div class="task-item-content">
            <h4>${taskToAdd.task}</h4>
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
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    // store the task info for easy editing later
    taskDiv.dataset.taskText = taskToAdd.task;
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
    const deleteBtn = taskDiv.querySelector(".delete-btn"); // optional, we’ll keep it active
    const taskText = taskDiv.querySelector("h4");

    //DELETE CONFIRMATION MODAL + BUTTONS
    const deleteConfirmationModal = document.getElementById("delete-modal");
    const confirmDelBtn = document.getElementById("confirm-delete-btn");
    const cancelDelBtn = document.getElementById("cancel-delete-btn");


    //EDIT MODAL
    const editModal = document.getElementById("edit-modal");
    const editTaskInput = document.getElementById("emodal-task-text");

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
        await toggleTaskDoneOnBackend(taskDiv.dataset.id, newDoneStatus);
    });

    //FOR DELETE BUTTON
    let taskToDelete = null;
    deleteBtn.addEventListener("click", () =>{  
        console.log("Delete button clicked for task:", taskDiv.dataset.id);      
        deleteConfirmationModal.style.display = "flex";
        taskToDelete = taskDiv;
    });

    confirmDelBtn.addEventListener("click", async () => {
        console.log("Confirm delete clicked");
        if (taskToDelete){
            const taskID = taskToDelete.dataset.id;
            console.log("Task ID to delete:", taskID);
            
            const deletedTask = await deleteTaskOnBackend(taskID);
            console.log("Backend response:", deletedTask);

            if(deletedTask){
                console.log("Removing task from DOM");
                taskToDelete.remove();
                sortTasksBy(currentSort);
                toggleEmptyModal();
            }  else {
            console.log("Backend deletion failed, not removing from DOM");
            }
        } else {
        console.log("No task selected for deletion");
    }
        deleteConfirmationModal.style.display = "none";
        taskToDelete = null;
    });

    cancelDelBtn.addEventListener("click", () => {
        console.log("Cancel delete clicked");
        deleteConfirmationModal.style.display = "none";
        taskToDelete = null;
    });


    //FOR EDIT BUTTON
    const taskFormListContainer = document.querySelector(".task-form-list-container");


    let taskToEdit = null;
    
    editBtn.addEventListener("click", () => {
        
        editModal.style.display = "flex";
        taskFormListContainer.classList.add("disabled");

        taskToEdit = taskDiv;

        editTaskInput.value = taskDiv.dataset.taskText;

        //set tastk tex
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

        const updatedInfo = {
            task: newText,
            priority: newPriority,
            dueDate: newDueDate,
            dueTime: newDueTime
        };

        await updateTaskOnBackend(taskToEdit.dataset.id, updatedInfo);

        // Update dataset
        taskToEdit.dataset.taskText = newText;
        taskToEdit.dataset.priority = newPriority;
        taskToEdit.dataset.dueDate = newDueDate ;
        taskToEdit.dataset.dueTime = newDueTime ;
        
        // **Update the visible UI**
        taskToEdit.querySelector("h4").textContent = newText;
        taskToEdit.querySelector(".task-item-priority span").textContent = newPriority;
        taskToEdit.querySelector(".task-item-duedate small").textContent =
        formatDueDateDisplay(newDueDate, newDueTime);

        sortTasksBy(currentSort);
        editModal.style.display = "none";
        taskFormListContainer.classList.remove("disabled");
        taskToEdit = null; // clear reference
    });
    
    
    
    cancelEmodalBtn.addEventListener("click", () => {
        editModal.style.display = "none";
        taskFormListContainer.classList.remove("disabled");
        taskToEdit = null;
    });




}

//BACKEND INTEGRATION
const loadTasksFromBackend = async () => {
    try {
        const res = await fetch("/tasks/");
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const tasks = await res.json();

        // Add each task to the UI
        tasks.forEach(task => {
            addTaskToUI(task); // reuse your existing function
        });

        toggleEmptyModal(); // update empty message if needed
    } catch (err) {
        console.error("Error loading tasks:", err);
    }
}

const toggleTaskDoneOnBackend = async (taskID, doneStatus) => {
    try {
        const res = await fetch(`/tasks/${taskID}`, {
            method: "PATCH", // we only update one property
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ done: doneStatus })
        });

        if (!res.ok) throw new Error("Failed to update task");

        const updatedTask = await res.json();
        console.log("Task updated:", updatedTask);
        return updatedTask;
    } catch (err) {
        console.error("Failed to update done status:", err);
    }
};

const addTaskToBackend = async (taskInfo) => {
  try {
    const res = await fetch("/tasks/", {   // no need for full localhost URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskInfo)
    });

    if (!res.ok) throw new Error("Failed to add task");

    const newTask = await res.json();
    return newTask;

  } catch (err) {
    console.error("Error adding task:", err);
    return null;
  }
};

const deleteTaskOnBackend = async (taskID) => {
    try {
        const res = await fetch(`/tasks/${taskID}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to delete task");
        }

        const data = await res.json();
        console.log("Task deleted from backend:", data);
        return data.task; // returns the deleted task info
    } catch (err) {
        console.error("Delete failed:", err);
    }
}

const updateTaskOnBackend = async (taskID, updatedInfo) => {
    try {
        const res = await fetch(`/tasks/${taskID}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedInfo)
        });

        if (!res.ok) throw new Error("Failed to update task");

        const updatedTask = await res.json();
        console.log("Task updated on backend:", updatedTask);
        return updatedTask;
    } catch (err) {
        console.error("Update failed:", err);
    }
};







// INITIALIZE FUNCTIONS HERE
loadTasksFromBackend();
addTaskTextInput.addEventListener("input", updateAddButton);
showTimePicker();
toggleEmptyModal();
processUserAddTask();






