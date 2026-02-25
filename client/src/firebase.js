// src/firebase.js (Complete & Corrected Firebase Initialization with Your Config)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// Optional: Analytics if you want it (not required for our features)
import { getAnalytics } from 'firebase/analytics';

// Your provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVYR2YpBlRg9KvsfMbMqyD3k7Og3wKGJo",
  authDomain: "sandsolutions-1e822.firebaseapp.com",
  projectId: "sandsolutions-1e822",
  storageBucket: "sandsolutions-1e822.firebasestorage.app",
  messagingSenderId: "770745908829",
  appId: "1:770745908829:web:61e8d0df577d7f88b797b4",
  measurementId: "G-WQRPQNQ31X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Optional: Analytics (safe to keep – no impact if unused)
const analytics = getAnalytics(app);