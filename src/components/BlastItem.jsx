// Member 13: BlastItem Lead
import { useTheme } from "../utils/theme";

import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Badge from "./Badge";

const BlastItem = ({ blast, onPress }) => {
  const isScheduled = blast.status === "Scheduled";
  const statusColor = isScheduled ? "#FF9900" : "#2ECC71";

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
        <Text style={styles.statusIcon}>{isScheduled ? "⏳" : "✓"}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{blast.title}</Text>
        <Text style={styles.subtitle}>{blast.status}</Text>
        <Text style={styles.subtitle}>📍 {blast.targetArea}</Text>
        {blast.createdByName && (
          <Text style={styles.createdBy}>Planned by: {blast.createdByName}</Text>
        )}
        <Text style={styles.time}>
          {new Date(blast.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Badge label={blast.status} color={statusColor} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "useTheme().colors.card",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "useTheme().colors.border",
  },
  statusIndicator: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusIcon: {
    fontSize: 16,
    color: "theme.colors.text",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "useTheme().colors.text",
  },
  subtitle: {
    fontSize: 12,
    color: "useTheme().colors.text",
    marginTop: 2,
  },
  createdBy: {
    fontSize: 11,
    color: "useTheme().colors.text",
    fontStyle: "italic",
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: "useTheme().colors.text",
    marginTop: 1,
  },
});

export default BlastItem;
