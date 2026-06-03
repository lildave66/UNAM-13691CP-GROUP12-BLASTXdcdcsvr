import AsyncStorage from "@react-native-async-storage/async-storage";

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

import { db, auth, authHelpers } from "./firebase";

const CACHE_KEYS = {
  IS_SETUP_COMPLETE: "blastx_is_setup_complete",

  CACHED_USER: "blastx_cache_user",
};

export const MINE_ROLES = {
  ENGINEER: "Engineer",

  SPECIALIST: "Specialist",

  ANALYST: "Analyst",

  SUPERVISOR: "Supervisor",

  MANAGER: "Manager",

  TECHNICIAN: "Technician",
};

const EDITABLE_ROLES = ["Engineer", "Specialist", "Analyst"];

export const RBAC = {
  canEditBlasts: (userRole, isAdmin = false) =>
    isAdmin || EDITABLE_ROLES.includes(userRole),

  canCreateBlasts: (userRole, isAdmin = false) =>
    isAdmin || EDITABLE_ROLES.includes(userRole),

  canViewAllRecords: (userRole) => true,

  isCompanyAdmin: (userId, companyData) => userId === companyData?.registeredBy,

  getUserAccessLevel: (userRole, isAdmin = false) =>
    isAdmin || EDITABLE_ROLES.includes(userRole) ? "EDITOR" : "VIEWER",
};

export const storage = {
  getUserData: async (forceRefresh = false) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No authenticated user");

        return null;
      }

      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);

        if (cached) return JSON.parse(cached);
      }

      const userDocRef = doc(db, "users", currentUser.uid);

      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.warn("User document not found in Firestore");

        return null;
      }

      const userData = { uid: currentUser.uid, ...userSnap.data() };

      await AsyncStorage.setItem(
        CACHE_KEYS.CACHED_USER,
        JSON.stringify(userData),
      );

      return userData;
    } catch (error) {
      console.error("Error getting user data:", error);

      return null;
    }
  },

  updateUserPosition: async (userId, minePosition) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const companyCode =
        userData.companyCode || userData.company?.code || null;

      const isAdmin = userId === userData.company?.registeredBy;
      const canCreateBlasts = isAdmin || EDITABLE_ROLES.includes(minePosition);

      await updateDoc(userDocRef, {
        minePosition,
        canCreateBlasts,
        updatedAt: serverTimestamp(),
      });

      if (companyCode) {
        const teammateDocRef = doc(
          db,
          "companies",
          companyCode,
          "team",
          userId,
        );
        await updateDoc(teammateDocRef, {
          minePosition,
          canCreateBlasts,
          updatedAt: serverTimestamp(),
        });
      }

      const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);

      if (cached) {
        const cachedData = JSON.parse(cached);
        cachedData.minePosition = minePosition;
        cachedData.canCreateBlasts = canCreateBlasts;

        await AsyncStorage.setItem(
          CACHE_KEYS.CACHED_USER,
          JSON.stringify(cachedData),
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating user position:", error);

      return false;
    }
  },

  updateCompanyInfo: async (companyCode, details) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error("No authenticated user");

      const companyDocRef = doc(db, "companies", companyCode);

      await updateDoc(companyDocRef, {
        ...details,

        updatedAt: serverTimestamp(),
      });

      const userDocRef = doc(db, "users", currentUser.uid);

      await updateDoc(userDocRef, {
        company: details,

        updatedAt: serverTimestamp(),
      });

      await AsyncStorage.setItem(CACHE_KEYS.IS_SETUP_COMPLETE, "true");

      return true;
    } catch (error) {
      console.error("Error updating company info:", error);

      return false;
    }
  },

  saveBlast: async (blast) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error("No authenticated user");

      const companyCode = blast.companyCode;

      if (!companyCode) throw new Error("Company code required");

      const blastsRef = collection(db, "companies", companyCode, "blasts");

      const newBlastData = {
        ...blast,

        createdBy: currentUser.uid,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(blastsRef, newBlastData);

      return {
        id: docRef.id,
        ...newBlastData,
      };
    } catch (error) {
      console.error("Error saving blast:", error);

      return null;
    }
  },

  getBlasts: async (companyCode, maxResults = 20) => {
    try {
      if (!companyCode) throw new Error("Company code required");

      const blastsRef = collection(db, "companies", companyCode, "blasts");

      const q = query(
        blastsRef,
        orderBy("createdAt", "desc"),
        limit(maxResults),
      );

      const querySnapshot = await getDocs(q);

      const blasts = [];

      querySnapshot.forEach((doc) => {
        blasts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return blasts;
    } catch (error) {
      console.error("Error getting blasts:", error);

      return [];
    }
  },

  getBlastById: async (companyCode, blastId) => {
    try {
      const blastDocRef = doc(db, "companies", companyCode, "blasts", blastId);

      const blastSnap = await getDoc(blastDocRef);

      if (!blastSnap.exists()) {
        return null;
      }

      return {
        id: blastSnap.id,
        ...blastSnap.data(),
      };
    } catch (error) {
      console.error("Error getting blast:", error);

      return null;
    }
  },

  recordBlastResults: async (companyCode, blastId, resultData) => {},

  deleteBlast: async (companyCode, blastId) => {
    try {
      const blastDocRef = doc(db, "companies", companyCode, "blasts", blastId);

      await deleteDoc(blastDocRef);

      return true;
    } catch (error) {
      console.error("Error deleting blast:", error);

      return false;
    }
  },

  getCompany: async (companyCode) => {
    try {
      const companyDocRef = doc(db, "companies", companyCode);

      const companySnap = await getDoc(companyDocRef);

      if (companySnap.exists()) {
        return { code: companyCode, ...companySnap.data() };
      }

      return null;
    } catch (error) {
      console.error("Error getting company:", error);

      return null;
    }
  },

  getRecents: async (companyCode, maxResults = 50) => {
    try {
      return await storage.getBlasts(companyCode, maxResults);
    } catch (error) {
      console.error("Error getting recents:", error);

      return [];
    }
  },

  getFavorites: async (companyCode) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return [];

      const favoritesRef = collection(
        db,
        "companies",
        companyCode,
        "favorites",
      );

      const q = query(favoritesRef, where("userId", "==", currentUser.uid));

      const querySnapshot = await getDocs(q);

      const favorites = [];

      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return favorites;
    } catch (error) {
      console.error("Error getting favorites:", error);

      return [];
    }
  },

  addFavorite: async (companyCode, blastId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error("No authenticated user");

      const favoritesRef = collection(
        db,
        "companies",
        companyCode,
        "favorites",
      );

      await addDoc(favoritesRef, {
        userId: currentUser.uid,
        blastId,

        addedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error adding favorite:", error);

      return false;
    }
  },

  removeFavorite: async (companyCode, favoriteId) => {
    try {
      const favoriteDocRef = doc(
        db,
        "companies",
        companyCode,
        "favorites",
        favoriteId,
      );

      await deleteDoc(favoriteDocRef);

      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);

      return false;
    }
  },

  getTeammates: async (companyCode) => {
    try {
      const teamRef = collection(db, "companies", companyCode, "team");

      const querySnapshot = await getDocs(teamRef);

      const teammates = [];

      querySnapshot.forEach((doc) => {
        teammates.push({
          uid: doc.id,
          ...doc.data(),
        });
      });

      return teammates;
    } catch (error) {
      console.error("Error fetching teammates:", error);

      return [];
    }
  },

  removeTeammate: async (companyCode, userId) => {
    try {
      const teammateDocRef = doc(db, "companies", companyCode, "team", userId);

      await deleteDoc(teammateDocRef);

      const userDocRef = doc(db, "users", userId);

      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data().companyCode === companyCode) {
        await updateDoc(userDocRef, {
          companyCode: null,

          company: null,

          updatedAt: serverTimestamp(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error removing teammate:", error);

      return false;
    }
  },

  updateTeammatePosition: async (companyCode, userId, newPosition) => {
    try {
      const companyDocRef = doc(db, "companies", companyCode);
      const companySnap = await getDoc(companyDocRef);
      const isAdmin =
        companySnap.exists() && companySnap.data().registeredBy === userId;

      const canCreateBlasts = isAdmin || EDITABLE_ROLES.includes(newPosition);

      const teammateDocRef = doc(db, "companies", companyCode, "team", userId);

      await updateDoc(teammateDocRef, {
        minePosition: newPosition,

        canCreateBlasts: canCreateBlasts,

        updatedAt: serverTimestamp(),
      });

      const userDocRef = doc(db, "users", userId);

      await updateDoc(userDocRef, {
        minePosition: newPosition,

        canCreateBlasts: canCreateBlasts,

        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error updating teammate position:", error);

      return false;
    }
  },

  getTeammatesByRole: async (companyCode, role) => {
    try {
      const teamRef = collection(db, "companies", companyCode, "team");

      const q = query(teamRef, where("minePosition", "==", role));

      const querySnapshot = await getDocs(q);

      const teammates = [];

      querySnapshot.forEach((doc) => {
        teammates.push({
          uid: doc.id,
          ...doc.data(),
        });
      });

      return teammates;
    } catch (error) {
      console.error("Error filtering teammates:", error);

      return [];
    }
  },

  getCompanySettings: async (companyCode) => {
    try {
      const settingsDocRef = doc(
        db,
        "companies",
        companyCode,
        "settings",
        "config",
      );

      const settingsSnap = await getDoc(settingsDocRef);

      if (!settingsSnap.exists()) {
        return null;
      }

      return settingsSnap.data();
    } catch (error) {
      console.error("Error getting company settings:", error);

      return null;
    }
  },

  toggleRBAC: async (companyCode, enabled, userId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error("No authenticated user");

      const companyDocRef = doc(db, "companies", companyCode);

      const companySnap = await getDoc(companyDocRef);

      if (!companySnap.exists()) throw new Error("Company not found");

      const companyData = companySnap.data();

      if (companyData.registeredBy !== currentUser.uid) {
        throw new Error("Only company admin can toggle RBAC");
      }

      const settingsDocRef = doc(
        db,
        "companies",
        companyCode,
        "settings",
        "config",
      );

      await setDoc(
        settingsDocRef,
        {
          rbacEnabled: enabled,

          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return true;
    } catch (error) {
      console.error("Error toggling RBAC:", error);

      return false;
    }
  },

  isSetupComplete: async () => {
    try {
      const value = await AsyncStorage.getItem(CACHE_KEYS.IS_SETUP_COMPLETE);

      return value === "true";
    } catch (error) {
      return false;
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.IS_SETUP_COMPLETE);

      await AsyncStorage.removeItem(CACHE_KEYS.CACHED_USER);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};
