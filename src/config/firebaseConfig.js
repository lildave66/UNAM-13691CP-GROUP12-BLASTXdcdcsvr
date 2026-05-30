/**
 * Firebase Configuration
 *
 * This file is the actual Firebase config used by the app at runtime.
 * It is imported by src/utils/firebase.js, so it must exist for Firebase to work.
 *
 * WARNING: If this contains real API keys, do not commit it to source control.
 * The repo already ignores src/config/firebaseConfig.js in .gitignore.
 */

// Export a named constant or helper
export const firebaseConfig = {
// Style object property
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDIevRJg9vdWl9o4n5e6L_fbl13xBDWaUA", // Firebase Web API key
// Style object property
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "blastx-717d3.firebaseapp.com", // Firebase Auth domain
// Style object property
  projectId: process.env.FIREBASE_PROJECT_ID || "blastx-717d3", // Firebase project ID
// Style object property
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "blastx-717d3.firebasestorage.app", // Firebase storage bucket
// Style object property
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "403108878690", // Firebase messaging sender ID
// Style object property
  appId: process.env.FIREBASE_APP_ID || "1:403108878690:web:312501a9b154586086b43b", // Firebase app ID
// Style object property
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-1328PTWS86", // Optional Firebase Analytics measurement ID
};

/**
 * NOTE:
 * - src/config/firebaseConfig.example.js is only a template.
 * - Copy that file to src/config/firebaseConfig.js if you want a clean starting point.
 * - This file is required by the app and should contain your real Firebase values.

 */
