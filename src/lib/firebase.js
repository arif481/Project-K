import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCklKPhNlfh-RNqEAy0PpBdNrnywaWxxLE",
    authDomain: "project-k-cb95f.firebaseapp.com",
    projectId: "project-k-cb95f",
    storageBucket: "project-k-cb95f.firebasestorage.app",
    messagingSenderId: "120959811313",
    appId: "1:120959811313:web:b17e28f3b06fd314813350",
    measurementId: "G-PV7XBYMX9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
