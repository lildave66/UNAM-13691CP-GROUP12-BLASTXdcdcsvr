




import React from "react";

import { Pressable, Text, StyleSheet } from "react-native";


const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}) => {

  const isSecondary = variant === "secondary";


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


export default Button;


const styles = StyleSheet.create({

  button: {

    borderRadius: 14,

    paddingVertical: 16,

    paddingHorizontal: 24,

    alignItems: "center",

    justifyContent: "center",

    minWidth: 180,
  },

  primaryButton: {

    backgroundColor: "#FF9900",

    shadowColor: "#FF9900",

    shadowOffset: { width: 0, height: 8 },

    shadowOpacity: 0.2,

    shadowRadius: 12,

    elevation: 5,
  },

  secondaryButton: {

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E0E0E0",
  },

  label: {

    fontSize: 16,

    fontWeight: "700",
  },

  primaryLabel: {

    color: "#FFFFFF",
  },

  secondaryLabel: {

    color: "#1A1F3A",
  },

  pressed: {

    opacity: 0.85,
  },

  disabledButton: {

    opacity: 0.6,
  },
});
