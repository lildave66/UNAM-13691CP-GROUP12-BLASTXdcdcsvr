/*
 * File: src\navigation\AppNavigator.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React, { useEffect, useState } from "react";
// Import project dependencies
import { ActivityIndicator, View } from "react-native";
// Import project dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Import project dependencies
import { doc, getDoc } from "firebase/firestore";
// Import project dependencies
import { db } from "../utils/firebase";
// Import project dependencies
import { storage } from "../utils/storage";

// Screens
// Import project dependencies
import HomeScreen from "../screens/HomeScreen";
// Import project dependencies
import LoginScreen from "../screens/LoginScreen";
// Import project dependencies
import SignupScreen from "../screens/SignupScreen";
// Import project dependencies
import ProfileScreen from "../screens/ProfileScreen";
// Import project dependencies
import SetupScreen from "../screens/SetupScreen";
// Import project dependencies
import PlanEventScreen from "../screens/PlanEventScreen";
// Import project dependencies
import BlastHistoryScreen from "../screens/BlastHistoryScreen";
// Import project dependencies
import RecordBlastResultsScreen from "../screens/RecordBlastResultsScreen";
// Import project dependencies
import DashboardScreen from "../screens/DashboardScreen";
// Import project dependencies
import AdminSettingsScreen from "../screens/AdminSettingsScreen";

// Declare a constant or variable
const Stack = createNativeStackNavigator();

// Export a named constant or helper
export const AppNavigator = ({ user }) => {
  const [setupComplete, setSetupComplete] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadSetupState = async () => {
      if (!user) {
        if (isMounted) {
          setSetupComplete(null);
        }
        return;
      }

      const userData = await storage.getUserData(true);
      const isSetupDone = await storage.isSetupComplete();

      let shouldRouteToSetup = false;

      if (!userData?.companyCode) {
        shouldRouteToSetup = !isSetupDone;
      } else {
        const companySnap = await getDoc(
          doc(db, "companies", userData.companyCode),
        );
        const companyData = companySnap.exists() ? companySnap.data() : null;

        shouldRouteToSetup =
          companyData?.registeredBy === user.uid && !isSetupDone;
      }

      if (isMounted) {
        setSetupComplete(!shouldRouteToSetup);
      }
    };

    loadSetupState();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  if (setupComplete === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F9FA",
        }}
      >
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
      initialRouteName={setupComplete === false ? "Setup" : "Dashboard"}
      key={user.uid + (setupComplete === false ? "-setup" : "-dashboard")}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen
        name="PlanEvent"
        component={PlanEventScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="BlastHistory" component={BlastHistoryScreen} />
      <Stack.Screen
        name="RecordBlastResults"
        component={RecordBlastResultsScreen}
      />
    </Stack.Navigator>
  );
};

// Export the default component or module
export default AppNavigator;
