import { useTheme } from "../utils/theme";

import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Badge from "./Badge";

const BlastItem = ({ blast, onPress }) => {
  const { theme } = useTheme();
  const isScheduled = blast.status === "Scheduled";
  const statusColor = isScheduled ? "#FF9900" : "#2ECC71";
  const authorName = blast.createdByName || blast.createdBy || "Unknown user";

  const isNew =
    Math.floor(
      (Date.now() - new Date(blast.createdAt).getTime()) / (1000 * 60 * 60),
    ) < 24;

  const getBlastIcon = () => {
    if (blast?.blastSize === "Large") return "💥";
    if (blast?.blastSize === "Medium") return "⚡";
    return "◇";
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
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
      color: theme.text,
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
    },
    subtitle: {
      fontSize: 12,
      color: theme.text,
      marginTop: 2,
    },
    createdBy: {
      fontSize: 11,
      color: theme.text,
      fontStyle: "italic",
      marginTop: 2,
    },
    time: {
      fontSize: 11,
      color: theme.text,
      marginTop: 1,
    },
    newBadge: {
      backgroundColor: "#FF6B6B",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    newBadgeText: {
      fontSize: 10,
      color: "#FFF",
      fontWeight: "bold",
    },
  });

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
        <Text style={styles.statusIcon}>{isScheduled ? "⏳" : "✓"}</Text>
      </View>
      <View style={styles.info}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.title}>{blast.title}</Text>
          <Text>{getBlastIcon()}</Text>
        </View>
        <Text style={styles.subtitle}>{blast.status}</Text>
        <Text style={styles.subtitle}>📍 {blast?.targetArea}</Text>
        <Text style={styles.createdBy}>Set by: {authorName}</Text>
        <Text style={styles.time}>
          {new Date(blast.createdAt).toLocaleDateString()}
        </Text>
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>🆕 New</Text>
          </View>
        )}
      </View>
      <Badge label={blast.status} color={statusColor} />
    </Pressable>
  );
};

export default BlastItem;
