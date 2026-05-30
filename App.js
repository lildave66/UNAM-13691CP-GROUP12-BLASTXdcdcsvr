/*
 * File: App.js
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React, { useEffect, useState } from "react";
// Import project dependencies
import { NavigationContainer } from "@react-navigation/native";
// Import project dependencies
import { ActivityIndicator, View } from "react-native";
// Import project dependencies
import { onAuthStateChanged } from "firebase/auth";
// Import project dependencies
import { auth } from "./src/utils/firebase";
// Import project dependencies
import { registerForPushNotificationsAsync } from "./src/utils/notifications";
// Import project dependencies
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/utils/theme";

// Export the default component or module
export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      
      if (user) {
        console.log("User is signed in:", user.uid);
        // Register for push notifications when user is signed in
        registerForPushNotificationsAsync();
      } else {
        console.log("No user signed in");
      }
    });

    console.log("Firebase initialized");

    return () => {
      unsubscribe();
    };
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

// Return JSX layout
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator user={user} />
      </NavigationContainer>
    </ThemeProvider>
  );
}
