// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "assetflow-p3qcd",
  appId: "1:90578118014:web:6de93c160f078a9a4b3f2f",
  storageBucket: "assetflow-p3qcd.firebasestorage.app",
  apiKey: "AIzaSyCsgsagw272W6Nf3HAyVu7hOZVqw_9-MtM",
  authDomain: "assetflow-p3qcd.firebaseapp.com",
  messagingSenderId: "90578118014",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
