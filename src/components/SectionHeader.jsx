import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SectionHeader = ({ title, style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1F3A",
  },
});

export default SectionHeader;
