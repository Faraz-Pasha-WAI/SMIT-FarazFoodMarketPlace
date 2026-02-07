import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAI-UgNZZ9LpNzInDek2xB1bdUg5RRDxLE",
  authDomain: "foodstorefaraz.firebaseapp.com",
  projectId: "foodstorefaraz",
  storageBucket: "foodstorefaraz.firebasestorage.app",
  messagingSenderId: "972725145915",
  appId: "1:972725145915:web:697c611d796380a31fe71e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase initialized successfully!");