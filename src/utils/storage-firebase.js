/**
 * Firebase-backed Storage Service (Production)
 * All data is now stored in Firestore with proper authentication and RBAC
 */

// Import project dependencies
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import project dependencies
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
// Import project dependencies
import { db, auth, authHelpers } from "./firebase";

// Declare a constant or variable
const CACHE_KEYS = {
// Style object property
  IS_SETUP_COMPLETE: "blastx_is_setup_complete",
// Style object property
  CACHED_USER: "blastx_cache_user",
};

// ROLE DEFINITIONS
// Export a named constant or helper
export const MINE_ROLES = {
// Style object property
  ENGINEER: "Engineer",
// Style object property
  SPECIALIST: "Specialist",
// Style object property
  ANALYST: "Analyst",
// Style object property
  SUPERVISOR: "Supervisor",
// Style object property
  MANAGER: "Manager",
// Style object property
  TECHNICIAN: "Technician",
};

// EDITABLE ROLES (can create and edit blast records)
// Declare a constant or variable
const EDITABLE_ROLES = ["Engineer", "Specialist", "Analyst"];

/**
 * ROLE-BASED ACCESS CONTROL
 */
// Export a named constant or helper
export const RBAC = {
// Style object property
  canEditBlasts: (userRole, isAdmin = false) => isAdmin || EDITABLE_ROLES.includes(userRole),
// Style object property
  canCreateBlasts: (userRole, isAdmin = false) => isAdmin || EDITABLE_ROLES.includes(userRole),
// Style object property
  canViewAllRecords: (userRole) => true,
// Style object property
  isCompanyAdmin: (userId, companyData) => userId === companyData?.registeredBy,
// Style object property
  getUserAccessLevel: (userRole, isAdmin = false) =>
    (isAdmin || EDITABLE_ROLES.includes(userRole)) ? "EDITOR" : "VIEWER",
};

/**
 * Storage API - Production with Firebase
 */
// Export a named constant or helper
export const storage = {
  /**
   * USER PROFILE METHODS
   */
// Style object property
  getUserData: async (forceRefresh = false) => {
// Control flow statement
    try {
// Declare a constant or variable
      const currentUser = auth.currentUser;
// Control flow statement
      if (!currentUser) {
        console.error("No authenticated user");
// Return a value from the function
        return null;
      }

      // Check cache first
// Control flow statement
      if (!forceRefresh) {
// Declare a constant or variable
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
// Control flow statement
        if (cached) return JSON.parse(cached);
      }

      // Fetch from Firestore
// Declare a constant or variable
      const userDocRef = doc(db, "users", currentUser.uid);
// Declare a constant or variable
      const userSnap = await getDoc(userDocRef);

// Control flow statement
      if (!userSnap.exists()) {
        console.warn("User document not found in Firestore");
// Return a value from the function
        return null;
      }

// Declare a constant or variable
      const userData = { uid: currentUser.uid, ...userSnap.data() };

      // Cache it
// Wait for an asynchronous operation
      await AsyncStorage.setItem(CACHE_KEYS.CACHED_USER, JSON.stringify(userData));

// Return a value from the function
      return userData;
    } catch (error) {
      console.error("Error getting user data:", error);
// Return a value from the function
      return null;
    }
  },

// Style object property
  updateUserPosition: async (userId, minePosition) => {
// Control flow statement
    try {
// Declare a constant or variable
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      
      // Admin always has creation permissions
      const isAdmin = userId === userData.company?.registeredBy;
      const canCreateBlasts = isAdmin || EDITABLE_ROLES.includes(minePosition);

// Wait for an asynchronous operation
      await updateDoc(userDocRef, {
        minePosition,
        canCreateBlasts,
// Style object property
        updatedAt: serverTimestamp(),
      });

      // Update cache
// Declare a constant or variable
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
// Control flow statement
      if (cached) {
// Declare a constant or variable
        const cachedData = JSON.parse(cached);
        cachedData.minePosition = minePosition;
        cachedData.canCreateBlasts = canCreateBlasts;
// Wait for an asynchronous operation
        await AsyncStorage.setItem(CACHE_KEYS.CACHED_USER, JSON.stringify(cachedData));
      }

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error updating user position:", error);
// Return a value from the function
      return false;
    }
  },

// Style object property
  updateCompanyInfo: async (companyCode, details) => {
// Control flow statement
    try {
// Declare a constant or variable
      const currentUser = auth.currentUser;
// Control flow statement
      if (!currentUser) throw new Error("No authenticated user");

// Declare a constant or variable
      const companyDocRef = doc(db, "companies", companyCode);
// Wait for an asynchronous operation
      await updateDoc(companyDocRef, {
        ...details,
// Style object property
        updatedAt: serverTimestamp(),
      });

      // Update user cache
// Declare a constant or variable
      const userDocRef = doc(db, "users", currentUser.uid);
// Wait for an asynchronous operation
      await updateDoc(userDocRef, {
// Style object property
        company: details,
// Style object property
        updatedAt: serverTimestamp(),
      });

// Wait for an asynchronous operation
      await AsyncStorage.setItem(CACHE_KEYS.IS_SETUP_COMPLETE, "true");

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error updating company info:", error);
// Return a value from the function
      return false;
    }
  },

  /**
   * BLAST OPERATIONS METHODS
   */
// Style object property
  saveBlast: async (blast) => {
// Control flow statement
    try {
// Declare a constant or variable
      const currentUser = auth.currentUser;
// Control flow statement
      if (!currentUser) throw new Error("No authenticated user");

// Declare a constant or variable
      const companyCode = blast.companyCode;
// Control flow statement
      if (!companyCode) throw new Error("Company code required");

// Declare a constant or variable
      const blastsRef = collection(
        db,
        "companies",
        companyCode,
        "blasts"
      );

// Declare a constant or variable
      const newBlastData = {
        ...blast,
// Style object property
        createdBy: currentUser.uid,
// Style object property
        createdAt: serverTimestamp(),
// Style object property
        updatedAt: serverTimestamp(),
      };

// Declare a constant or variable
      const docRef = await addDoc(blastsRef, newBlastData);

// Return a value from the function
      return {
// Style object property
        id: docRef.id,
        ...newBlastData,
      };
    } catch (error) {
      console.error("Error saving blast:", error);
// Return a value from the function
      return null;
    }
  },

// Style object property
  getBlasts: async (companyCode, maxResults = 20) => {
// Control flow statement
    try {
// Control flow statement
      if (!companyCode) throw new Error("Company code required");

// Declare a constant or variable
      const blastsRef = collection(
        db,
        "companies",
        companyCode,
        "blasts"
      );

// Declare a constant or variable
      const q = query(
        blastsRef,
        orderBy("createdAt", "desc"),
        limit(maxResults)
      );

// Declare a constant or variable
      const querySnapshot = await getDocs(q);
// Declare a constant or variable
      const blasts = [];

      querySnapshot.forEach((doc) => {
        blasts.push({
// Style object property
          id: doc.id,
          ...doc.data(),
        });
      });

// Return a value from the function
      return blasts;
    } catch (error) {
      console.error("Error getting blasts:", error);
// Return a value from the function
      return [];
    }
  },

// Style object property
  getBlastById: async (companyCode, blastId) => {
// Control flow statement
    try {
// Declare a constant or variable
      const blastDocRef = doc(
        db,
        "companies",
        companyCode,
        "blasts",
        blastId
      );
// Declare a constant or variable
      const blastSnap = await getDoc(blastDocRef);

// Control flow statement
      if (!blastSnap.exists()) {
// Return a value from the function
        return null;
      }

// Return a value from the function
      return {
// Style object property
        id: blastSnap.id,
        ...blastSnap.data(),
      };
    } catch (error) {
      console.error("Error getting blast:", error);
// Return a value from the function
      return null;
    }
  },

// Style object property
  recordBlastResults: async (companyCode, blastId, resultData) => {
// ... (existing recordBlastResults)
  },

// Style object property
  deleteBlast: async (companyCode, blastId) => {
// Control flow statement
    try {
// Declare a constant or variable
      const blastDocRef = doc(
        db,
        "companies",
        companyCode,
        "blasts",
        blastId
      );
// Wait for an asynchronous operation
      await deleteDoc(blastDocRef);
// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error deleting blast:", error);
// Return a value from the function
      return false;
    }
  },

  /**
   * COMPANY METHODS
   */
// Style object property
  getCompany: async (companyCode) => {
// Control flow statement
    try {
// Declare a constant or variable
      const companyDocRef = doc(db, "companies", companyCode);
// Declare a constant or variable
      const companySnap = await getDoc(companyDocRef);

// Control flow statement
      if (companySnap.exists()) {
// Return a value from the function
        return { code: companyCode, ...companySnap.data() };
      }
// Return a value from the function
      return null;
    } catch (error) {
      console.error("Error getting company:", error);
// Return a value from the function
      return null;
    }
  },

  /**
   * RECENTS & FAVORITES
   */
// Style object property
  getRecents: async (companyCode, maxResults = 50) => {
// Control flow statement
    try {
// Return a value from the function
      return await storage.getBlasts(companyCode, maxResults);
    } catch (error) {
      console.error("Error getting recents:", error);
// Return a value from the function
      return [];
    }
  },

// Style object property
  getFavorites: async (companyCode) => {
// Control flow statement
    try {
// Declare a constant or variable
      const currentUser = auth.currentUser;
// Control flow statement
      if (!currentUser) return [];

// Declare a constant or variable
      const favoritesRef = collection(
        db,
        "companies",
        companyCode,
        "favorites"
      );

// Declare a constant or variable
      const q = query(
        favoritesRef,
        where("userId", "==", currentUser.uid)
      );

// Declare a constant or variable
      const querySnapshot = await getDocs(q);
// Declare a constant or variable
      const favorites = [];

      querySnapshot.forEach((doc) => {
        favorites.push({
// Style object property
          id: doc.id,
          ...doc.data(),
        });
      });

// Return a value from the function
      return favorites;
    } catch (error) {
      console.error("Error getting favorites:", error);
// Return a value from the function
      return [];
    }
  },

// Style object property
  addFavorite: async (companyCode, blastId) => {
// Control flow statement
    try {
// Declare a constant or variable
      const currentUser = auth.currentUser;
// Control flow statement
      if (!currentUser) throw new Error("No authenticated user");

// Declare a constant or variable
      const favoritesRef = collection(
        db,
        "companies",
        companyCode,
        "favorites"
      );

// Wait for an asynchronous operation
      await addDoc(favoritesRef, {
// Style object property
        userId: currentUser.uid,
        blastId,
// Style object property
        addedAt: serverTimestamp(),
      });

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error adding favorite:", error);
// Return a value from the function
      return false;
    }
  },

// Style object property
  removeFavorite: async (companyCode, favoriteId) => {
// Control flow statement
    try {
// Declare a constant or variable
      const favoriteDocRef = doc(
        db,
        "companies",
        companyCode,
        "favorites",
        favoriteId
      );

// Wait for an asynchronous operation
      await deleteDoc(favoriteDocRef);

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
// Return a value from the function
      return false;
    }
  },

  /**
   * TEAM MANAGEMENT
   */
// Style object property
  getTeammates: async (companyCode) => {
// Control flow statement
    try {
// Declare a constant or variable
      const teamRef = collection(
        db,
        "companies",
        companyCode,
        "team"
      );

// Declare a constant or variable
      const querySnapshot = await getDocs(teamRef);
// Declare a constant or variable
      const teammates = [];

      querySnapshot.forEach((doc) => {
        teammates.push({
// Style object property
          uid: doc.id,
          ...doc.data(),
        });
      });

// Return a value from the function
      return teammates;
    } catch (error) {
      console.error("Error fetching teammates:", error);
// Return a value from the function
      return [];
    }
  },

// Style object property
  removeTeammate: async (companyCode, userId) => {
// Control flow statement
    try {
// Declare a constant or variable
      const teammateDocRef = doc(
        db,
        "companies",
        companyCode,
        "team",
        userId
      );
// Wait for an asynchronous operation
      await deleteDoc(teammateDocRef);

      // Also clear company info from user document if they belong to this company
// Declare a constant or variable
      const userDocRef = doc(db, "users", userId);
// Declare a constant or variable
      const userSnap = await getDoc(userDocRef);
// Control flow statement
      if (userSnap.exists() && userSnap.data().companyCode === companyCode) {
// Wait for an asynchronous operation
        await updateDoc(userDocRef, {
// Style object property
          companyCode: null,
// Style object property
          company: null,
// Style object property
          updatedAt: serverTimestamp(),
        });
      }

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error removing teammate:", error);
// Return a value from the function
      return false;
    }
  },

// Style object property
  updateTeammatePosition: async (companyCode, userId, newPosition) => {
// Control flow statement
    try {
      // Check if this user is the admin to preserve permissions
      const companyDocRef = doc(db, "companies", companyCode);
      const companySnap = await getDoc(companyDocRef);
      const isAdmin = companySnap.exists() && companySnap.data().registeredBy === userId;

      const canCreateBlasts = isAdmin || EDITABLE_ROLES.includes(newPosition);

      // Update in team collection
// Declare a constant or variable
      const teammateDocRef = doc(
        db,
        "companies",
        companyCode,
        "team",
        userId
      );
// Wait for an asynchronous operation
      await updateDoc(teammateDocRef, {
// Style object property
        minePosition: newPosition,
// Style object property
        canCreateBlasts: canCreateBlasts,
// Style object property
        updatedAt: serverTimestamp(),
      });

      // Update in global users collection
// Declare a constant or variable
      const userDocRef = doc(db, "users", userId);
// Wait for an asynchronous operation
      await updateDoc(userDocRef, {
// Style object property
        minePosition: newPosition,
// Style object property
        canCreateBlasts: canCreateBlasts,
// Style object property
        updatedAt: serverTimestamp(),
      });

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error updating teammate position:", error);
// Return a value from the function
      return false;
    }
  },

// Style object property
  getTeammatesByRole: async (companyCode, role) => {
// Control flow statement
    try {
// Declare a constant or variable
      const teamRef = collection(
        db,
        "companies",
        companyCode,
        "team"
      );

// Declare a constant or variable
      const q = query(teamRef, where("minePosition", "==", role));

// Declare a constant or variable
      const querySnapshot = await getDocs(q);
// Declare a constant or variable
      const teammates = [];

      querySnapshot.forEach((doc) => {
        teammates.push({
// Style object property
          uid: doc.id,
          ...doc.data(),
        });
      });

// Return a value from the function
      return teammates;
    } catch (error) {
      console.error("Error filtering teammates:", error);
// Return a value from the function
      return [];
    }
  },

  /**
   * COMPANY SETTINGS
   */
// Style object property
  getCompanySettings: async (companyCode) => {
// Control flow statement
    try {
// Declare a constant or variable
      const settingsDocRef = doc(
        db,
        "companies",
        companyCode,
        "settings",
        "config"
      );

// Declare a constant or variable
      const settingsSnap = await getDoc(settingsDocRef);

// Control flow statement
      if (!settingsSnap.exists()) {
// Return a value from the function
        return null;
      }

// Return a value from the function
      return settingsSnap.data();
    } catch (error) {
      console.error("Error getting company settings:", error);
// Return a value from the function
      return null;
    }
  },

// Style object property
  toggleRBAC: async (companyCode, enabled, userId) => {
// Control flow statement
    try {
// Declare a constant or variable
      const currentUser = auth.currentUser;
// Control flow statement
      if (!currentUser) throw new Error("No authenticated user");

      // Verify user is admin
// Declare a constant or variable
      const companyDocRef = doc(db, "companies", companyCode);
// Declare a constant or variable
      const companySnap = await getDoc(companyDocRef);

// Control flow statement
      if (!companySnap.exists()) throw new Error("Company not found");

// Declare a constant or variable
      const companyData = companySnap.data();
// Control flow statement
      if (companyData.registeredBy !== currentUser.uid) {
// Control flow statement
        throw new Error("Only company admin can toggle RBAC");
      }

      // Update settings
// Declare a constant or variable
      const settingsDocRef = doc(
        db,
        "companies",
        companyCode,
        "settings",
        "config"
      );

// Wait for an asynchronous operation
      await setDoc(
        settingsDocRef,
        {
// Style object property
          rbacEnabled: enabled,
// Style object property
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

// Return a value from the function
      return true;
    } catch (error) {
      console.error("Error toggling RBAC:", error);
// Return a value from the function
      return false;
    }
  },

  /**
   * SETUP STATE
   */
// Style object property
  isSetupComplete: async () => {
// Control flow statement
    try {
// Declare a constant or variable
      const value = await AsyncStorage.getItem(CACHE_KEYS.IS_SETUP_COMPLETE);
// Return a value from the function
      return value === "true";
    } catch (error) {
// Return a value from the function
      return false;
    }
  },

  /**
   * CLEANUP
   */
// Style object property
  clearAll: async () => {
// Control flow statement
    try {
// Wait for an asynchronous operation
      await AsyncStorage.removeItem(CACHE_KEYS.IS_SETUP_COMPLETE);
// Wait for an asynchronous operation
      await AsyncStorage.removeItem(CACHE_KEYS.CACHED_USER);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};
