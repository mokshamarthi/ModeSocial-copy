// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getStorage } from "firebase/storage";

//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHzOW2htel2jAH1P1y8Hlsw5KPsdVUMo4",
  authDomain: "modesocial-a53e8.firebaseapp.com",
  projectId: "modesocial-a53e8",
  storageBucket: "modesocial-a53e8.firebasestorage.app",
  messagingSenderId: "782848192787",
  appId: "1:782848192787:web:cdb1e1342d0f759eb7aae6",
  measurementId: "G-ESX8Z1YK6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
//export const storage = getStorage(app);