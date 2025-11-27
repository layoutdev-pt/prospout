import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Initialize Firebase - only once
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore;

try {
  // Initialize Firebase only if config is complete
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    (!getApps().length)
  ) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else if (getApps().length) {
    db = getFirestore(getApp());
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { db };
export default db;
