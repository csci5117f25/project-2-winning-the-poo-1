// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'
import { GoogleAuthProvider } from 'firebase/auth'


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG2nMt_5H_-WDaCjyaB6mOI244ZnYAOic",
  authDomain: "project-2-wtp.firebaseapp.com",
  projectId: "project-2-wtp",
  storageBucket: "project-2-wtp.firebasestorage.app",
  messagingSenderId: "876214258840",
  appId: "1:876214258840:web:8c3abd2a52971a8bd954ed"
};


// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const provider = new GoogleAuthProvider();
