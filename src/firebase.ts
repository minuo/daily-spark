import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0018407775",
  appId: "1:195733362768:web:aaf8187312008f5a6c1955",
  apiKey: "AIzaSyDRof2eGWJ_UeohFQCPa144at-ZCQGrgDw",
  authDomain: "gen-lang-client-0018407775.firebaseapp.com",
  storageBucket: "gen-lang-client-0018407775.firebasestorage.app",
  messagingSenderId: "195733362768"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-e46330ba-4a78-4e51-867b-f522f2e0afee");
export const auth = getAuth(app);

// Simple anonymous auth for syncing with gentle fallback
export const signInAnonymous = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.warn("Firebase Anonymous Auth restricted or unavailable. Running in local fallback mode.", error);
    return null;
  }
};
