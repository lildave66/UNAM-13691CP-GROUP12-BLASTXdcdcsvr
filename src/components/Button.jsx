/*
 * File: src\components\Button.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React from "react";
// Import project dependencies
import { Pressable, Text, StyleSheet } from "react-native";

// Declare a constant or variable
const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}) => {
// Declare a constant or variable
  const isSecondary = variant === "secondary";

// Return JSX layout
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondaryButton : styles.primaryButton,
        pressed && styles.pressed,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          isSecondary ? styles.secondaryLabel : styles.primaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// Export the default component or module
export default Button;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  button: {
// Style object property
    borderRadius: 14,
// Style object property
    paddingVertical: 16,
// Style object property
    paddingHorizontal: 24,
// Style object property
    alignItems: "center",
// Style object property
    justifyContent: "center",
// Style object property
    minWidth: 180,
  },
// Style object property
  primaryButton: {
// Style object property
    backgroundColor: "#FF9900",
// Style object property
    shadowColor: "#FF9900",
// Style object property
    shadowOffset: { width: 0, height: 8 },
// Style object property
    shadowOpacity: 0.2,
// Style object property
    shadowRadius: 12,
// Style object property
    elevation: 5,
  },
// Style object property
  secondaryButton: {
// Style object property
    backgroundColor: "#FFFFFF",
// Style object property
    borderWidth: 1,
// Style object property
    borderColor: "#E0E0E0",
  },
// Style object property
  label: {
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "700",
  },
// Style object property
  primaryLabel: {
// Style object property
    color: "#FFFFFF",
  },
// Style object property
  secondaryLabel: {
// Style object property
    color: "#1A1F3A",
  },
// Style object property
  pressed: {
// Style object property
    opacity: 0.85,
  },
// Style object property
  disabledButton: {
// Style object property
    opacity: 0.6,
  },
});
