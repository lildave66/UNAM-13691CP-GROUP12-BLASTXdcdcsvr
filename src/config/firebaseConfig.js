export const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyBC2oaphuML4Nx1GvWn8m7J0s4l9bVMg5U",

  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || "blastx-95436.firebaseapp.com",

  projectId: process.env.FIREBASE_PROJECT_ID || "blastx-95436",

  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "blastx-95436.firebasestorage.app",

  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "220783300604",

  appId:
    process.env.FIREBASE_APP_ID || "1:220783300604:web:3f21cb88c1a987eb8dac79",

  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-1328PTWS86",
};
