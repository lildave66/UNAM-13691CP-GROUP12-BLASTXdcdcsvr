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
import { db, auth } from "./firebase";

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
 * ROLE-BASED ACCESS CONTROL UTILITIES
 */
// Export a named constant or helper
export const RBAC = {
  // Style object property
  canEditBlasts: (userRole) => EDITABLE_ROLES.includes(userRole),
  // Style object property
  canCreateBlasts: (userRole) => EDITABLE_ROLES.includes(userRole),
  // Style object property
  canViewAllRecords: (userRole) => true,
  // Style object property
  isCompanyAdmin: (userId, companyData) => userId === companyData?.registeredBy,
  // Style object property
  getUserAccessLevel: (userRole) =>
    EDITABLE_ROLES.includes(userRole) ? "EDITOR" : "VIEWER",
};

// Declare a constant or variable
const MOCK_MODE = false; // Set to false to use real Firebase

// Mock Data for testing
const MOCK_USER = {
  uid: "mock-user-123",
  name: "Lead Miner John",
  email: "john@minecorp.com",
  minePosition: "Engineer",
  companyCode: "MINE-2026",
  company: {
    name: "North Pit Mining Inc.",
    mineType: "Underground Coal",
    location: "Northern Region",
    rbacEnabled: true,
    registeredBy: "mock-user-123",
  },
};

const MOCK_BLASTS = [
  {
    id: "blast-1",
    title: "East Sector Primary",
    targetArea: "Zone A-4",
    blastSize: "500",
    holes: "45",
    status: "Scheduled",
    launchDate: "2026-06-15 14:00",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    explosivesUsed: "ANFO",
  },
  {
    id: "blast-2",
    title: "North Vent Expansion",
    targetArea: "Vent Shaft 2",
    blastSize: "250",
    holes: "20",
    status: "Completed",
    launchDate: "2026-05-10 09:00",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    results: { rocksFragmented: "1200 tons", productivityRating: 92 },
  },
];

const syncUserCanCreateBlasts = async (userData) => {
  if (!userData || !auth.currentUser) return userData;

  if (userData.uid && userData.uid !== auth.currentUser.uid) {
    return userData;
  }

  const expectedCanCreateBlasts = RBAC.canCreateBlasts(userData?.minePosition);
  const shouldSync =
    typeof userData?.canCreateBlasts === "undefined" ||
    userData.canCreateBlasts !== expectedCanCreateBlasts;

  if (!shouldSync) {
    return userData;
  }

  const userDocRef = doc(db, "users", auth.currentUser.uid);
  await updateDoc(userDocRef, {
    canCreateBlasts: expectedCanCreateBlasts,
    updatedAt: serverTimestamp(),
  });

  const updatedUserData = {
    ...userData,
    canCreateBlasts: expectedCanCreateBlasts,
  };

  await AsyncStorage.setItem(
    CACHE_KEYS.CACHED_USER,
    JSON.stringify(updatedUserData),
  );

  return updatedUserData;
};

const hydrateCompanyDetails = async (userData) => {
  if (!userData?.companyCode) {
    return userData;
  }

  try {
    const companySnap = await getDoc(
      doc(db, "companies", userData.companyCode),
    );

    if (!companySnap.exists()) {
      return userData;
    }

    const companyData = companySnap.data();
    const mergedCompany = {
      ...(userData.company || {}),
      ...companyData,
    };

    if (
      JSON.stringify(userData.company || {}) === JSON.stringify(mergedCompany)
    ) {
      return userData;
    }

    const updatedUserData = {
      ...userData,
      company: mergedCompany,
    };

    await AsyncStorage.setItem(
      CACHE_KEYS.CACHED_USER,
      JSON.stringify(updatedUserData),
    );

    return updatedUserData;
  } catch (error) {
    console.error("Error hydrating company details:", error);
    return userData;
  }
};

// Export a named constant or helper
export const storage = {
  /**
   * USER PROFILE METHODS
   */
  getUserData: async (forceRefresh = false) => {
    try {
      if (MOCK_MODE) return MOCK_USER;

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("No authenticated user, returning null");
        return null;
      }

      // Check cache first
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
        if (cached) {
          const cachedUser = JSON.parse(cached);
          const syncedUser = await syncUserCanCreateBlasts(cachedUser);
          return await hydrateCompanyDetails(syncedUser);
        }
      }

      // Fetch from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.warn("User document not found in Firestore");
        return null;
      }

      const userData = { uid: currentUser.uid, ...userSnap.data() };
      const syncedUserData = await syncUserCanCreateBlasts(userData);
      const hydratedUserData = await hydrateCompanyDetails(syncedUserData);

      // Cache it
      await AsyncStorage.setItem(
        CACHE_KEYS.CACHED_USER,
        JSON.stringify(hydratedUserData),
      );

      return hydratedUserData;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  updateUserPosition: async (userId, minePosition) => {
    try {
      const canCreateBlasts = RBAC.canCreateBlasts(minePosition);
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        minePosition,
        canCreateBlasts,
        updatedAt: serverTimestamp(),
      });

      // Update cache
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
      if (cached) {
        const userData = JSON.parse(cached);
        userData.minePosition = minePosition;
        userData.canCreateBlasts = canCreateBlasts;
        await AsyncStorage.setItem(
          CACHE_KEYS.CACHED_USER,
          JSON.stringify(userData),
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

      // Update user cache
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        company: details,
        updatedAt: serverTimestamp(),
      });

      const cachedUser = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        await AsyncStorage.setItem(
          CACHE_KEYS.CACHED_USER,
          JSON.stringify({
            ...parsedUser,
            company: { ...(parsedUser.company || {}), ...details },
          }),
        );
      }

      await AsyncStorage.setItem(CACHE_KEYS.IS_SETUP_COMPLETE, "true");

      return true;
    } catch (error) {
      console.error("Error updating company info:", error);
      return false;
    }
  },

  /**
   * BLAST OPERATIONS METHODS
   */
  saveBlast: async (blast) => {
    try {
      if (MOCK_MODE) {
        return {
          id: `mock-${Date.now()}`,
          ...blast,
          createdAt: new Date().toISOString(),
        };
      }

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user");

      const userData = (await storage.getUserData(true)) || {};
      const companyCode = blast.companyCode || userData?.companyCode;
      if (!companyCode) throw new Error("Company code required");

      const expectedCanCreateBlasts = RBAC.canCreateBlasts(
        userData?.minePosition,
      );
      const shouldSyncCanCreateBlasts =
        typeof userData?.canCreateBlasts === "undefined" ||
        userData.canCreateBlasts !== expectedCanCreateBlasts;

      if (shouldSyncCanCreateBlasts) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          canCreateBlasts: expectedCanCreateBlasts,
          updatedAt: serverTimestamp(),
        });

        userData.canCreateBlasts = expectedCanCreateBlasts;
        await AsyncStorage.setItem(
          CACHE_KEYS.CACHED_USER,
          JSON.stringify(userData),
        );
      }

      const blastsRef = collection(db, "companies", companyCode, "blasts");

      const newBlastData = {
        ...blast,
        companyCode,
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
      if (MOCK_MODE) return MOCK_BLASTS;

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
      if (MOCK_MODE) {
        const blast = MOCK_BLASTS.find((b) => b.id === blastId);
        return blast || null;
      }

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

  recordBlastResults: async (companyCode, blastId, resultData) => {
    try {
      if (MOCK_MODE) {
        console.log("Mock: Recorded results for", blastId, resultData);
        return true;
      }

      const blastDocRef = doc(db, "companies", companyCode, "blasts", blastId);

      await updateDoc(blastDocRef, {
        results: resultData,
        status: "Completed",
        recordedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error recording blast results:", error);
      return false;
    }
  },

  /**
   * RECENTS & FAVORITES
   */
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

  /**
   * TEAM MANAGEMENT
   */
  getTeammates: async (companyCode) => {
    try {
      if (MOCK_MODE) {
        return [
          MOCK_USER,
          {
            uid: "m2",
            name: "Sara Tech",
            email: "sara@mine.com",
            minePosition: "Technician",
          },
          {
            uid: "m3",
            name: "Mike Supervisor",
            email: "mike@mine.com",
            minePosition: "Supervisor",
          },
        ];
      }

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

  getTeammatesByRole: async (companyCode, role) => {
    try {
      if (MOCK_MODE) {
        return [MOCK_USER].filter((u) => u.minePosition === role);
      }

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

  /**
   * COMPANY SETTINGS
   */
  getCompanySettings: async (companyCode) => {
    try {
      if (MOCK_MODE) return MOCK_USER.company;

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

  /**
   * SETUP STATE
   */
  isSetupComplete: async () => {
    try {
      const value = await AsyncStorage.getItem(CACHE_KEYS.IS_SETUP_COMPLETE);
      return value === "true";
    } catch (error) {
      return false;
    }
  },

  /**
   * CLEANUP
   */
  clearAll: async () => {
    try {
      console.log("Mock: Clearing all storage");
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  },
};
