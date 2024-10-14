import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDkEWlLClXrFIZ6zFvHibQt9DXrKauuEuU",
  authDomain: "podcast-generato.firebaseapp.com",
  projectId: "podcast-generato",
  storageBucket: "podcast-generato.appspot.com",
  messagingSenderId: "1061499459103",
  appId: "1:1061499459103:web:577cef2fcc7a1b1e02a72a",
  measurementId: "G-4SB6QSKX6N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
