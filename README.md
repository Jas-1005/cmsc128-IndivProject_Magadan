# cmsc128-IndivProject_Magadan.

A simple To-Do web application inspired by Microsoft To-Do

I. FRONTEND
    - index.html : Homepage
    - style.css : Stylesheet
    - script.js : javascript file for integratinhg      frontend with backend


II. BACKEND: 
    - TDServer.js : backend server (Node.js + Express)
    - tasks.json : Temporary file-based storage for tasks (will later be migrated to Firebase), contains an array of tasks objects

Node.js:
    - The node.js app is the server, while the browser is the client; hence making the device act both as the server and the client
    - Express was used to simplify routing and access Node.js module (such as the file system module ("fs))
    - Backend methods(POST, GET, PATCH, DELETE) were tested using Postman
    - cors (cross port access) was no longer used since frontend files are read from the public folder

API Endpoints (Base URL: http://localhost:4000/)
    1. POST :  adding new task (object)
    2. GET : retrieve array of tasks from storage
    3. PATCH : modify certain attributes of a task object (partial update, other fields remain unchanged)
    4. DELETE : delete a task by ID (using array splice in file storage)

III. DATABASE 
    Currently using JSON files for local storage. Will be reconfigured to use Firebase Firestore for a fully functional, document-based solution with queries, indexing, and real-time synchronization.


TO-DO :ACCOUNT CREATIONS, LOGIN, FIREBASE RECONFIGURATION
