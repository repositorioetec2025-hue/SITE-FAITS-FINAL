import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyBE7a0EGMdfZYQW3krUdqkj7XNJcEjdZC8",
  authDomain: "projeto-faits.firebaseapp.com",
  projectId: "projeto-faits",
  storageBucket: "projeto-faits.appspot.com",
  messagingSenderId: "1059992621627",
  appId: "1:1059992621627:web:e7e8f35c79187bbd0b021e"
};

const app = initializeApp(firebaseConfig);

// EXPORTE A NOVA FERRAMENTA
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
