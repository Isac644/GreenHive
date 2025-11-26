// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, query, where, updateDoc, arrayUnion, getDoc, deleteDoc, writeBatch, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// ADICIONE 'sendEmailVerification' NA LINHA ABAIXO:
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updateProfile, 
    GoogleAuthProvider, 
    signInWithPopup, 
    sendEmailVerification, 
    sendPasswordResetEmail, // <--- ADICIONE AQUI
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAR3WgBFwC4mB0D1z2hNAbxjyENPzpWRks",
    authDomain: "tcc-etec-644.firebaseapp.com",
    projectId: "tcc-etec-644",
    storageBucket: "tcc-etec-644.firebasestorage.app",
    messagingSenderId: "182743524460",
    appId: "1:182743524460:web:355fab489855e13241e449",
    measurementId: "G-EXQ4K6B6ZK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const firebase = {
    getFirestore, collection, addDoc, getDocs, doc, query, where, updateDoc, arrayUnion, getDoc, deleteDoc, writeBatch, onSnapshot,
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updateProfile, 
    signInWithPopup, 
    sendEmailVerification, 
    sendPasswordResetEmail // <--- ADICIONE AQUI TAMBÉM
};