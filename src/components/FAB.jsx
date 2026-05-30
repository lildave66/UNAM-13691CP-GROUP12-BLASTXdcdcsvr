/*
 * File: src\components\FAB.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React from "react";
// Import project dependencies
import { StyleSheet, Pressable, Text, View } from "react-native";

// Define a function or component using an arrow function
const FAB = ({ onPress }) => {
// Return JSX layout
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.plus}>＋</Text>
      </Pressable>
    </View>
  );
};

// Export the default component or module
export default FAB;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  container: {
// Style object property
    position: "absolute",
// Style object property
    right: 18,
// Style object property
    bottom: 26,
// Style object property
    zIndex: 50,
  },
// Style object property
  button: {
// Style object property
    width: 60,
// Style object property
    height: 60,
// Style object property
    borderRadius: 30,
// Style object property
    backgroundColor: "#FF9900",
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
// Style object property
    elevation: 6,
// Style object property
    shadowColor: "#FF9900",
// Style object property
    shadowOffset: { width: 0, height: 4 },
// Style object property
    shadowOpacity: 0.3,
// Style object property
    shadowRadius: 8,
  },
// Style object property
  plus: {
// Style object property
    color: "#FFF",
// Style object property
    fontSize: 32,
// Style object property
    lineHeight: 34,
// Style object property
    fontWeight: "700",
  },
// Style object property
  label: {
// Style object property
    display: "none",
  },
});
