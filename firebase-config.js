// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsuWwThA2wE0A9wA6oSMiRIJJvjX5gdNY",
  authDomain: "neoconnect-9898c.firebaseapp.com",
  databaseURL: "https://neoconnect-9898c-default-rtdb.firebaseio.com",
  projectId: "neoconnect-9898c",
  storageBucket: "neoconnect-9898c.firebasestorage.app",
  messagingSenderId: "143792969229",
  appId: "1:143792969229:web:5246821f712e84f65fa744",
  measurementId: "G-MW3DX7E8WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = firebase.firestore();