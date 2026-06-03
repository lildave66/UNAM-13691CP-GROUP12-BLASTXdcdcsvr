import { Alert } from "react-native";

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

import { db, auth } from "./firebase";

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

  isCompanyAdmin: (userId, companyData) => {
    if (!userId || !companyData) return false;
    return userId === companyData.registeredBy;
  },

  getUserAccessLevel: (userRole, isAdmin = false) =>
    isAdmin || EDITABLE_ROLES.includes(userRole) ? "EDITOR" : "VIEWER",
};

const MOCK_MODE = false;

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

export const storage = {
  getUserData: async (forceRefresh = false, userOverride = null) => {
    try {
      if (MOCK_MODE) return MOCK_USER;

      const currentUser = auth.currentUser || userOverride;
      if (!currentUser) {
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
        return cached ? JSON.parse(cached) : null;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.warn("User document not found in Firestore");
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
        return cached ? JSON.parse(cached) : null;
      }

      const userData = { uid: currentUser.uid, ...userSnap.data() };
      const syncedUserData = await syncUserCanCreateBlasts(userData);
      const hydratedUserData = await hydrateCompanyDetails(syncedUserData);

      await AsyncStorage.setItem(
        CACHE_KEYS.CACHED_USER,
        JSON.stringify(hydratedUserData),
      );

      return hydratedUserData;
    } catch (error) {
      console.error("Error getting user data:", error);
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
      return cached ? JSON.parse(cached) : null;
    }
  },

  getUserDataCached: async (forceRefresh = false, userOverride = null) => {
    try {
      const currentUser = auth.currentUser || userOverride;
      if (!currentUser) {
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
        return cached ? JSON.parse(cached) : null;
      }

      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
        if (cached) {
          const cachedUser = JSON.parse(cached);
          if (cachedUser?.uid === currentUser.uid) {
            syncUserCanCreateBlasts(cachedUser).catch(console.error);
            hydrateCompanyDetails(cachedUser).catch(console.error);
            return cachedUser;
          }
        }
      }

      return await storage.getUserData(true);
    } catch (error) {
      console.error("Error getting cached user data:", error);
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
      return cached ? JSON.parse(cached) : null;
    }
  },

  updateUserPosition: async (userId, minePosition) => {
    try {
      const canCreateBlasts = RBAC.canCreateBlasts(minePosition);
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const companyCode = userData.companyCode || null;

      await updateDoc(userDocRef, {
        minePosition,
        canCreateBlasts,
        updatedAt: serverTimestamp(),
      }).catch((err) => console.log("Offline: Update user position queued"));

      if (companyCode) {
        await updateDoc(doc(db, "companies", companyCode, "team", userId), {
          minePosition,
          canCreateBlasts,
          updatedAt: serverTimestamp(),
        }).catch((err) => console.log("Offline: Update team role queued"));
      }

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

      updateDoc(companyDocRef, {
        ...details,
        updatedAt: serverTimestamp(),
      }).catch((err) => console.log("Offline: Update company info queued"));

      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, {
        company: details,
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        console.log("Offline: Update user company info queued"),
      );

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

  getCompany: async (companyCode) => {
    try {
      if (!companyCode) return null;
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
      if (!currentUser) {
        const cached = await AsyncStorage.getItem(CACHE_KEYS.CACHED_USER);
        if (!cached)
          throw new Error("No authenticated user and no cache found.");
      }

      const userData = (await storage.getUserData()) || {};
      const companyCode = blast.companyCode || userData?.companyCode;
      if (!companyCode)
        throw new Error("Company code required for saving blasts.");

      const isAdmin = RBAC.isCompanyAdmin(
        currentUser?.uid || userData?.uid,
        userData?.company,
      );
      const expectedCanCreateBlasts = RBAC.canCreateBlasts(
        userData?.minePosition,
        isAdmin,
      );

      const shouldSyncCanCreateBlasts =
        typeof userData?.canCreateBlasts === "undefined" ||
        userData.canCreateBlasts !== expectedCanCreateBlasts;

      if (shouldSyncCanCreateBlasts && currentUser) {
        console.log("Syncing user permissions...");
        updateDoc(doc(db, "users", currentUser.uid), {
          canCreateBlasts: expectedCanCreateBlasts,
          updatedAt: serverTimestamp(),
        }).catch((err) => console.log("Offline: Sync permissions queued"));

        userData.canCreateBlasts = expectedCanCreateBlasts;
        await AsyncStorage.setItem(
          CACHE_KEYS.CACHED_USER,
          JSON.stringify(userData),
        );
      }

      if (!userData.canCreateBlasts && !isAdmin) {
        throw new Error(
          "You do not have permission to create blast records. Current role: " +
            (userData?.minePosition || "Unknown"),
        );
      }

      const blastsRef = collection(db, "companies", companyCode, "blasts");

      const newBlastData = {
        ...blast,
        companyCode,
        createdBy: currentUser?.uid || userData?.uid,
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

  deleteBlast: async (companyCode, blastId) => {
    try {
      if (!companyCode || !blastId) return false;
      const blastDocRef = doc(db, "companies", companyCode, "blasts", blastId);
      await deleteDoc(blastDocRef);
      return true;
    } catch (error) {
      console.error("Error deleting blast:", error);
      return false;
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
      console.log("Mock: Clearing all storage");
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  },
};
