/*
 * File: src\components\ScreenWrapper.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React from "react";
// Import project dependencies
import { SafeAreaView, StyleSheet } from "react-native";

// Define a function or component using an arrow function
const ScreenWrapper = ({ children, style }) => {
// Return JSX layout
  return (
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
  );
};

// Export the default component or module
export default ScreenWrapper;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  container: {
// Style object property
    flex: 1,
// Style object property
    backgroundColor: "#F8F9FA",
  },
});
