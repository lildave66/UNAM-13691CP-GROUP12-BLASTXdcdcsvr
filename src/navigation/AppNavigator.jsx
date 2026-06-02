






import React, { useEffect, useState } from "react";

import { ActivityIndicator, View } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../utils/firebase";

import { storage } from "../utils/storage";



import HomeScreen from "../screens/HomeScreen";

import LoginScreen from "../screens/LoginScreen";

import SignupScreen from "../screens/SignupScreen";

import ProfileScreen from "../screens/ProfileScreen";

import SetupScreen from "../screens/SetupScreen";

import PlanEventScreen from "../screens/PlanEventScreen";

import BlastHistoryScreen from "../screens/BlastHistoryScreen";

import RecordBlastResultsScreen from "../screens/RecordBlastResultsScreen";

import DashboardScreen from "../screens/DashboardScreen";

import AdminSettingsScreen from "../screens/AdminSettingsScreen";


const Stack = createNativeStackNavigator();


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

      
      const userData = await storage.getUserData();
      const isSetupDone = await storage.isSetupComplete();

      let shouldRouteToSetup = false;

      if (!userData?.companyCode) {
        shouldRouteToSetup = !isSetupDone;
      } else {
        try {
          const companySnap = await getDoc(
            doc(db, "companies", userData.companyCode),
          );
          const companyData = companySnap.exists() ? companySnap.data() : null;

          shouldRouteToSetup =
            companyData?.registeredBy === user.uid && !isSetupDone;
        } catch (error) {
          console.log("Offline or error during routing check:", error);
          
          shouldRouteToSetup = false;
        }
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


export default AppNavigator;
