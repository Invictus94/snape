import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Ove podatke dobiješ iz Firebase konzole (Project Settings > General > Your apps)
const firebaseConfig = {

  apiKey: "AIzaSyCGFTYggfnh4OAC3hbtlmovg6VjeB7rrwA",

  authDomain: "snape-bbaba.firebaseapp.com",

  projectId: "snape-bbaba",

  storageBucket: "snape-bbaba.firebasestorage.app",

  messagingSenderId: "779040795916",

  appId: "1:779040795916:web:0bcbb540b25b103d7bed29",

  measurementId: "G-6SK5PYVZS6"

};



// Inicijalizacija
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

