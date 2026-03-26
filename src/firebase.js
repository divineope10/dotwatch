// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnw782DECDb5JLmx7dbXT8qmFAdZjPSPE",
  authDomain: "dotscam-7cb80.firebaseapp.com",
  projectId: "dotscam-7cb80",
  storageBucket: "dotscam-7cb80.firebasestorage.app",
  messagingSenderId: "674224569369",
  appId: "1:674224569369:web:0380c9eb883a13c5cebe88",
  measurementId: "G-Y0R10FL1RC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();