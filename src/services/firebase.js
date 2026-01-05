import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBcGhWrIT0it8-4470Xb49gSRyLcMc1C_U",
    authDomain: "liturgiacg.firebaseapp.com",
    projectId: "liturgiacg",
    storageBucket: "liturgiacg.firebasestorage.app",
    messagingSenderId: "253780529700",
    appId: "1:253780529700:web:3fa366bed6c755a55d3eb1",
    measurementId: "G-T7GL4EJNTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable Offline Persistence (Critical for Churches with bad Wi-Fi)
// Enable Offline Persistence (Critical for Churches with bad Wi-Fi)
// import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// const db = initializeFirestore(app, {
//     localCache: persistentLocalCache({
//         tabManager: persistentMultipleTabManager()
//     })
// });

// TEMPORARY FIX: Disable persistence to resolve crash (Internal Assertion Failed)
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
