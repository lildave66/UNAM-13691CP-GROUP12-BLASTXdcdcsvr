import React from "react";
import { StyleSheet, Text, View } from "react-native";

const EmptyState = ({ icon, title, message, style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 48,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  message: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 5,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default EmptyState;
