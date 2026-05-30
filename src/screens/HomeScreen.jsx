/*
 * File: src\screens\HomeScreen.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import { StyleSheet, Text, View, Image, ActivityIndicator, Pressable } from "react-native";
// Import project dependencies
import React, { useEffect, useState } from "react";
// Import project dependencies
import { useNavigation } from "@react-navigation/native";
// Import project dependencies
import { storage } from "../utils/storage";
// Import project dependencies
import logo from "../utils/assets/images/icon.png";
// Import project dependencies
import { Button, ScreenWrapper, Spacer } from "../components";

// Define a function or component using an arrow function
const HomeScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();

// Return JSX layout
  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} />
        <Spacer size={32} />
        <Text style={styles.title}>BlastX</Text>
        <Spacer size={12} />
        <Text style={styles.subtitle}>
          Mine blast scheduling made simple.
        </Text>
        <Spacer size={40} />
        <Button
          label="Get Started"
          onPress={() => navigation.navigate("Signup")}
          style={styles.button}
        />
        <Spacer size={16} />
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: "#FF9900", fontWeight: "bold" }}>Login to Existing Account</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};

// Export the default component or module
export default HomeScreen;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  wrapper: {
// Style object property
    justifyContent: "center",
// Style object property
    paddingHorizontal: 28,
  },
// Style object property
  center: {
// Style object property
    flex: 1,
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
  },
// Style object property
  content: {
// Style object property
    alignItems: "center",
// Style object property
    paddingVertical: 80,
  },
// Style object property
  logo: {
// Style object property
    width: 140,
// Style object property
    height: 140,
// Style object property
    borderRadius: 28,
  },
// Style object property
  title: {
// Style object property
    fontSize: 36,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
// Style object property
    textAlign: "center",
  },
// Style object property
  subtitle: {
// Style object property
    fontSize: 16,
// Style object property
    color: "#6B7280",
// Style object property
    textAlign: "center",
// Style object property
    lineHeight: 24,
// Style object property
    marginHorizontal: 10,
  },
// Style object property
  button: {
// Style object property
    minWidth: 220,
  },
});
