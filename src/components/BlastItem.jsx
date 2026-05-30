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
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
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
    color: "#FFF",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 12,
    color: "#FF9900",
    marginTop: 2,
  },
  createdBy: {
    fontSize: 11,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: "#95A5A6",
    marginTop: 1,
  },
});

export default BlastItem;
