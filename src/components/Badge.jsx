import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Badge = ({ label, color = "#95A5A6", style = {} }) => {
  return (
    <View style={[styles.badge, { borderColor: color }, style]}>
      <Text style={[styles.badgeText, { color: color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Badge;
