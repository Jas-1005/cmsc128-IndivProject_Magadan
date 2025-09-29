// BACKEND SERVER

const express = require('express');
const fs = require("fs");

let toDo = JSON.parse(fs.readFileSync("TDlist.json")); //array of tasks

const app = express();


app.use(express.json());

//CREATE NEW
app.post("/TDlist", async (req, res) => {
  try {

    const newToDo = {
        id : Date.now(), //unique ID using timestamp
        task : req.body.task,
        done : false
    }

    toDo.push(newToDo);
   
    fs.writeFileSync("TDlist.json", JSON.stringify(toDo, null, 2))

    res.json(toDo)

  } catch (err) {
    res.status(500).json({ error: err.message }); //something wrong with server
  }
});

//SEND LIST TO CLIENT
app.get("/TDlist", async (req, res) => {
  try {
    res.json(toDo)

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//EDIT OR UPDATE AN OBJECT
app.put("/TDlist/:id", async (req, res) => { //: means this is a parameter
  try {
    const taskID = parseInt(req.params.id);
    const updatedTaskBody = req.body.task
    const updatedTaskStatus = req.body.done

    const taskToUpdate = toDo.find(t => t.id === taskID); 
    
    if (!taskToUpdate){
        return res.status(404).json({ error: "Task not found"})
    }

    taskToUpdate.task = updatedTaskBody;
    taskToUpdate.done = updatedTaskStatus;
    
    fs.writeFileSync("TDlist.json", JSON.stringify(toDo, null, 2));
    res.json(taskToUpdate);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/TDlist/:id", async (req, res) => { //: means this is a parameter
  try {
    const taskID = parseInt(req.params.id);
    
    const indexOfTaskToDelete = toDo.findIndex(t => t.id === taskID); 
    
    if (indexOfTaskToDelete === -1){
        return res.status(404).json({ error: "Task not found"});
    }
    
    const deletedTask = toDo.splice(indexOfTaskToDelete,1)[0];
    fs.writeFileSync("TDlist.json", JSON.stringify(toDo, null, 2));
    res.json({ message: "Task deleted", task: deletedTask });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(process.env.PORT || 1524, () =>  //1024 - 65535
    console.log('App available on http://localhost:1524'))