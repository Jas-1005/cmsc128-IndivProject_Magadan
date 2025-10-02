// BACKEND SERVER

const express = require('express');
const fs = require("fs");
const PORT = 4000;

const app = express();

app.use(express.json());
app.use(express.static("public"));

function readTasks() {
    try {
        const data = fs.readFileSync("tasks.json", "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.warn("tasks.json missing or invalid, starting with empty array");
        return [];
    }
}

// Utility function to save tasks
function saveTasks(tasks) {
    fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
}


//CREATE NEW
app.post("/tasks", async (req, res) => {
  try {
    console.log("Request body received:", req.body);
    const toDo = readTasks();

    const newToDo = {
        id : Date.now(), //unique ID using timestamp
        task : req.body.task,
        done : false,
        dateCreated: new Date().toISOString(),
        dueDate: req.body.dueDate || null, // Accept dueDate from client; store null if missing
        dueTime: req.body.dueTime || null,
        priority: req.body.priority || "low"
    };

    toDo.push(newToDo);
   
    fs.writeFileSync("tasks.json", JSON.stringify(toDo, null, 2));

    res.json(newToDo);

  } catch (err) {
    res.status(500).json({ error: err.message }); //something wrong with server
  }
});


//SEND LIST TO CLIENT
app.get("/tasks", async (req, res) => {
  try {
    const toDo = readTasks();
    res.json(toDo)

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//EDIT OR UPDATE AN OBJECT
app.patch("/tasks/:id", (req, res) => {
  try {
    const tasks = JSON.parse(fs.readFileSync("tasks.json", "utf-8"));
    const taskID = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskID);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Apply only fields that were sent
    if (typeof req.body.task !== 'undefined') {
      task.task = req.body.task;
    }

    if (typeof req.body.done !== 'undefined') {
      task.done = req.body.done;
    }

    if (typeof req.body.dueDate !== 'undefined') {
      task.dueDate = req.body.dueDate || null;
    }

    if (typeof req.body.dueTime !== 'undefined') {
      task.dueTime = req.body.dueTime || null;
    }

    if (typeof req.body.priority !== 'undefined') {
      task.priority = req.body.priority;
    }


    fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
    res.json({ message: "Task updated", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/tasks/:id", async (req, res) => { //: means this is a parameter
  try {
    const toDo = readTasks();
    const taskID = parseInt(req.params.id);
    
    const indexOfTaskToDelete = toDo.findIndex(t => t.id === taskID); 
    
    if (indexOfTaskToDelete === -1){
        return res.status(404).json({ error: "Task not found"});
    }
    
    const deletedTask = toDo.splice(indexOfTaskToDelete,1)[0];

    fs.writeFileSync("tasks.json", JSON.stringify(toDo, null, 2));
    res.json({ message: "Task deleted", task: deletedTask });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>  //1024 - 65535
    console.log(`App available on http://localhost:${PORT}`));

