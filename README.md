# cmsc128-IndivProject_Magadan.

A simple To-Do web application inspired by Microsoft To-Do

I. FRONTEND
    - index.html : Homepage
    - style.css : Stylesheet
    - script.js : javascript file for integratinhg      frontend with backend


II. BACKEND + DATABASE
    Firebase Auth for user authentication and firebase realtime database for username and email saving. 
    Firebase Firestore now used for a fully functional, document-based solution with queries, indexing, and real-time synchronization.


LAB 2: TO-DO :ACCOUNT CREATIONS, LOGIN, FIREBASE RECONFIGURATION
Account creations and logins use firebase auth and database.
Firebase Auth - can only store email and password
Firebase Database - where username is stored
Fire onAuthStatusChanged is used for user status persistence
Lpgin does not redirect yet but only uses flex and non display. 
Only hiding containers.
Updates are real-time but slower, as well as login and signup. 
Alerts by html will be changed to modal
Login and signup will be optimized by refactoring login.js


