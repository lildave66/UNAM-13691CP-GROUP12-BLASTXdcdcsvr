





import "react-native-get-random-values";
import "react-native-url-polyfill/auto";


import { initializeApp } from "firebase/app";

import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  initializeFirestore,
  persistentLocalCache,
  getFirestore,
} from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform } from "react-native";


import { firebaseConfig } from "../config/firebaseConfig";



const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];
const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);
if (missingFields.length > 0) {
  throw new Error(
    `Firebase config incomplete. Missing: ${missingFields.join(", ")}`,
  );
}


const app = initializeApp(firebaseConfig);


const auth = initializeAuth(app, {
  persistence:
    Platform.OS === "web"
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage),
});


let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch (e) {
  db = getFirestore(app);
}


export { app, auth, db };





export const authHelpers = {
  
  signUp: async (email, password) => {
    
    try {
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      
      return userCredential.user;
    } catch (error) {
      
      throw new Error(error.message);
    }
  },

  
  signIn: async (email, password) => {
    
    try {
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      
      return userCredential.user;
    } catch (error) {
      
      throw new Error(error.message);
    }
  },

  
  signOutUser: async () => {
    
    try {
      
      await signOut(auth);
    } catch (error) {
      
      throw new Error(error.message);
    }
  },

  
  getCurrentUser: () => {
    
    return auth.currentUser;
  },
};
