/**
 * Firebase Production Setup
 * Requires firebaseConfig.js with your Firebase credentials
 */

// Import project dependencies
import { initializeApp } from "firebase/app";
// Import project dependencies
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
// Import project dependencies
import { 
  initializeFirestore, 
  persistentLocalCache,
  getFirestore 
} from "firebase/firestore";
// Import project dependencies
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import project dependencies
import { Platform } from "react-native";

// Import project dependencies
import { firebaseConfig } from "../config/firebaseConfig";

// Validate config
// ... (omitting validation for brevity in replace context)
const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];
const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);
if (missingFields.length > 0) {
  throw new Error(`Firebase config incomplete. Missing: ${missingFields.join(", ")}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with cross-platform persistence
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore with persistence (Safer initialization)
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch (e) {
  db = getFirestore(app);
}

// Export module members
export { app, auth, db };

/**
 * Auth Helper Functions
 */
// Export a named constant or helper
export const authHelpers = {
// Style object property
  signUp: async (email, password) => {
// Control flow statement
    try {
// Declare a constant or variable
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
// Return a value from the function
      return userCredential.user;
    } catch (error) {
// Control flow statement
      throw new Error(error.message);
    }
  },

// Style object property
  signIn: async (email, password) => {
// Control flow statement
    try {
// Declare a constant or variable
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
// Return a value from the function
      return userCredential.user;
    } catch (error) {
// Control flow statement
      throw new Error(error.message);
    }
  },

// Style object property
  signOutUser: async () => {
// Control flow statement
    try {
// Wait for an asynchronous operation
      await signOut(auth);
    } catch (error) {
// Control flow statement
      throw new Error(error.message);
    }
  },

// Style object property
  getCurrentUser: () => {
// Return a value from the function
    return auth.currentUser;
  },
};
