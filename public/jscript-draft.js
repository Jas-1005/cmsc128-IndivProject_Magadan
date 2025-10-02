// const { response } = require("express");










document.addEventListener("DOMContentLoaded", () => {
    showTimePicker();
    validateDateTimePickers();
    toggleEmptyModal();
});

console.log("taskInput:", addTaskTextInput);
console.log("addBtn:", addBtn);


//only enable add button if form input is not empty






//BACKEND FUNCTIONS

// async function addTaskToBackend(taskInfo) {
//     try {
//         await fetch("http://localhost:3000/tasks", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(taskInfo),
//         });

//         console.log("Task added to backend");
//         return await response.json();
        
//     } catch (err) {
//         console.error("Failed to add task:", err);
//     }
// }

// function updateTaskDateAndTimePreview(){
//     const taskDateVal = addTaskDueDateInput.value;
//     const taskTimeVal = addTaskDueTimeInput.value;
//     const datePreview = document.getElementById("date-preview");
    
//     if (!taskDateVal){
//         datePreview.textContent ="";
//         return;
//     }

//     const dateTimeString = taskTimeVal ? `${taskDateVal}T${taskTimeVal}:00` : taskDateVal;
//   const dateObj = new Date(dateTimeString);

//   // Format
//   const dateOptions = { year: "numeric", month: "short", day: "numeric" };
//   const weekdayOptions = { weekday: "long" };
//   const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };

//   const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(dateObj);
//   const weekday = new Intl.DateTimeFormat("en-US", weekdayOptions).format(dateObj);
//   const formattedTime = taskTimeVal
//       ? new Intl.DateTimeFormat("en-US", timeOptions).format(dateObj)
//       : "";

//   // Final string
//   datePreview.textContent = taskTimeVal
//     ? `${formattedDate} (${weekday}) at ${formattedTime}`
//     : `${formattedDate} (${weekday})`;
// }

// // Listen for changes
// addTaskDueDateInput.addEventListener("input", updateTaskDateAndTimePreview);
// addTaskDueTimeInput.addEventListener("input", updateTaskDateAndTimePreview);



// addBtn.addEventListener("click", (e) => {
//     e.preventDefault();

//     const userTask = taskInput.value.trim();
//     const taskPriority = taskInput
//     const dueDate = dueDateInput.value;
//     if (!userTask) return;
//     const newTask = {
//         task: userTask,
//         dueDate: dueDate,
//         done: false,
//     }
//     addTaskToUI(newTask);
//     addTaskOnBackend(newTask.task, newTask.dueDate);
//     console.log(newTask);
//     taskInput.value = "";
//     dueDateInput.value ="";
//     addBtn.disabled = true;
//     addBtn.classList.remove("enabled");
//     checkEmptyTaskList();
// });

// taskList.addEventListener("click", (e) =>{
//     const buttonClicked = e.target;
//     const taskItem = buttonClicked.closest(".task");
    
//     if(!taskItem) return;
//     const taskId = taskItem.dataset.id;
    
//     if(buttonClicked.classList.contains("done-btn")){
//         const isDone = buttonClicked.classList.toggle("done");
//         markTaskDone = (taskId, isDone);
//     } 
    
//     if(buttonClicked.classList.contains("edit-btn")){ //MODIFY THIS, DO NOT LET EMPTY TASK, DO NOT ERASE TIME
//         const taskTextElem = taskItem.querySelector(".task-text");
//         const taskDateElem = taskItem.querySelector(".task-date");
//         const currentText = taskTextElem.textContent;
//         const currentDate = taskDateElem.textContent;
    
//         taskTextElem.innerHTML = `<input type="text" class="edit-task-input" value="${currentText}">`;
//         taskDateElem.innerHTML = `<input type="datetime-local" class="edit-task-date" value="${convertToInputDate(currentDate)}">`;
    
//         buttonClicked.textContent ="Save";
//         buttonClicked.classList.add("save-btn");
//         buttonClicked.classList.remove("edit-btn");
    
//     } else if (buttonClicked.classList.contains("save-btn")) {
//         const updatedText = taskItem.querySelector(".edit-task-input").value;
//         const updatedDate = taskItem.querySelector(".edit-task-date").value;
    
//         updateTaskInUI(taskId, updatedText, updatedDate)
//         updateTaskOnBackend(taskId, updatedText, updatedDate);
    
//         buttonClicked.textContent = "Edit";
//         buttonClicked.classList.add("edit-btn");
//         buttonClicked.classList.remove("save-btn");
//     }
//     if(buttonClicked.classList.contains("delete-btn")){
//         if (confirm("Are you sure you want to delete this task?")){
//             removeTaskFromUI(taskId);
//             deleteTaskOnBackend(taskId);
//             checkEmptyTaskList();
//         }
//     }
// });

// function checkEmptyTaskList() {
//     if (taskList.children.length === 0) {
//         taskList.innerHTML = `<li class="no-tasks-message" style="text-align:center;color:#888;padding:1em;">Phew! No tasks for now!</li>`;
//     } else {
//         const msg = taskList.querySelector('.no-tasks-message');
//         if (msg) msg.remove();
//     }
// }

// // Initial check on page load
// checkEmptyTaskList();


// function addTaskToUI(task){
//     const li = document.createElement("li");
//     li.dataset.id = task.id;

//     const dueDateText = task.dueDate ? "Due on: " + formatDateForDisplay(task.dueDate)
//                                     : "No due date for this task!";

//     li.innerHTML = `
//         <div class="task">
//             <button class="done-btn"></button>
//             <div class="task-content">
//                 <span class="task-text">${task.task}</span>
//                 <span class="task-date">${dueDateText}</span>
//             </div>
//             <div class="task-actions">
//                 <button class="edit-btn">Edit</button>
//                 <button class="delete-btn">Delete</button>
//             </div>
//         </div>
//     `;

//     taskList.appendChild(li);
// }

// function updateTaskInUI(taskId, updatedText, updatedDate) {
//     const taskItem = document.querySelector(`[data-id="${taskId}"]`);
//     if (!taskItem) return;
//     taskItem.querySelector(".task-text").textContent = updatedText;
//     taskItem.querySelector(".task-date").textContent = formatDateForDisplay(updatedDate);
// }

// function removeTaskFromUI(taskId) {
//     const taskItem = document.querySelector(`[data-id="${taskId}"]`);
//     if (!taskItem) return;
//     taskItem.remove();
// }

// function convertToInputDate(displayDate) {
//     // Convert "Sep 29, 2025" to "2025-09-29T00:00" for datetime-local
//     const d = new Date(displayDate);
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${d.getFullYear()}-${month}-${day}T00:00`;
// }

// function formatDateForDisplay(inputDate) {
//     // Convert "2025-09-29T00:00" back to readable format
//     const d = new Date(inputDate);
//     return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
// }


// //BACKEND INTEGRATION
// async function addTaskOnBackend(taskText, dueDate) {
//     try {
//         await fetch("http://localhost:1524/TDlist", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ task: taskText, dueDate: dueDate })
//         });
//         console.log("Task added to backend");
//     } catch (err) {
//         console.error("Failed to add task:", err);
//     }
// }

// async function updateTaskOnBackend(id, taskText, dueDate) {
//     try {
//         await fetch("http://localhost:1524/TDlist/"+id, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ task: taskText, dueDate: dueDate })
//         });
//         console.log("Task updated on backend");
//     } catch (err) {
//         console.error("Failed to update task:", err);
//     }
// }

// async function deleteTaskOnBackend(id) {
//     try {
//         await fetch("http://localhost:1524/TDlist/"+id, {
//             method: "DELETE"
//         });
//         console.log(`Task ${id} deleted from backend`);
//     } catch (err) {
//         console.error("Failed to delete task:", err);
//     }
// }

// async function markTaskDone(id, done) {
//     try {
//         await fetch("http://localhost:1524/TDlist/"+id, {
//             method: "PUT", // or PUT depending on your backend
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ done })
//         });
//         console.log(`Task ${id} marked done: ${done}`);
//     } catch (err) {
//         console.error("Failed to mark task done:", err);
//     }
// }


