




import React, { useEffect, useState } from "react";

import { NavigationContainer } from "@react-navigation/native";

import { ActivityIndicator, View } from "react-native";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./src/utils/firebase";

import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/utils/theme";


export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      
      if (user) {
        console.log("User is signed in:", user.uid);
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


  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator user={user} />
      </NavigationContainer>
    </ThemeProvider>
  );
}
