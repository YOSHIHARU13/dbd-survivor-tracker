// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW-IxpkkzqFxjCcTLwfHuDV6K7tJvlO0s",
  authDomain: "dbd-survivor-tracker.firebaseapp.com",
  projectId: "dbd-survivor-tracker",
  storageBucket: "dbd-survivor-tracker.firebasestorage.app",
  messagingSenderId: "853117989864",
  appId: "1:853117989864:web:d6f59a92b1b1126094ea5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;