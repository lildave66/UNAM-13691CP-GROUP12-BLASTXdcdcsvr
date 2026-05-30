/*
 * File: src\screens\BlastHistoryScreen.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
// Import project dependencies
import React, { useEffect, useState, useCallback } from "react";
// Import project dependencies
import { useNavigation, useFocusEffect } from "@react-navigation/native";
// Import project dependencies
import { storage } from "../utils/storage";
import { ExportUtils } from "../utils/export";
// Import project dependencies
import { 
  FAB, 
  Card, 
  EmptyState, 
  BlastItem 
} from "../components";

// Define a function or component using an arrow function
const BlastHistoryScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();
// Declare a constant or variable
  const [blasts, setBlasts] = useState([]);
  const [userData, setUserData] = useState(null);
// Declare a constant or variable
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
// Declare a constant or variable
  const [filterStatus, setFilterStatus] = useState("All"); // All, Scheduled, Completed, Failed

  useFocusEffect(
    useCallback(() => {
      loadBlastHistory();
    }, []),
  );

// Define a function or component using an arrow function
  const loadBlastHistory = async () => {
    setLoading(true);
    try {
      const data = await storage.getUserData();
      setUserData(data);
      const allBlasts = await storage.getBlasts(data?.companyCode, 100); // Get more blasts for history
      setBlasts(allBlasts);
    } catch (error) {
      console.error("Error loading blast history", error);
      Alert.alert("Error", "Failed to load blast history");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (getFilteredBlasts().length === 0) {
      Alert.alert("No Data", "There are no blast operations to export with the current filter.");
      return;
    }

    setExporting(true);
    try {
      await ExportUtils.generateBlastReport(
        getFilteredBlasts(),
        userData?.company,
        filterStatus
      );
    } catch (error) {
      console.error("Export failed", error);
      Alert.alert("Export Failed", "Could not generate PDF report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

// Define a function or component using an arrow function
  const getFilteredBlasts = () => {
// Control flow statement
    if (filterStatus === "All") return blasts;
// Return a value from the function
    return blasts.filter((b) => b.status === filterStatus);
  };

// Define a function or component using an arrow function
  const getStatusColor = (status) => {
// Control flow statement
    switch (status) {
// Control flow statement
      case "Scheduled":
// Return a value from the function
        return "#FF9900";
// Control flow statement
      case "Completed":
// Return a value from the function
        return "#27AE60";
// Control flow statement
      case "Failed":
// Return a value from the function
        return "#E74C3C";
// Control flow statement
      default:
// Return a value from the function
        return "#95A5A6";
    }
  };

// Define a function or component using an arrow function
  const formatDate = (dateString) => {
// Control flow statement
    if (!dateString) return "N/A";
// Control flow statement
    try {
// Declare a constant or variable
      const date = new Date(dateString.replace(" ", "T"));
// Return a value from the function
      return date.toLocaleDateString(undefined, {
// Style object property
        month: "short",
// Style object property
        day: "numeric",
// Style object property
        hour: "2-digit",
// Style object property
        minute: "2-digit",
      });
    } catch {
// Return a value from the function
      return dateString;
    }
  };

// Declare a constant or variable
  const renderBlastItem = ({ item }) => (
    <Pressable
      style={styles.blastCard}
      onPress={() => navigation.navigate("RecordBlastResults", { blast: item })}
    >
      <View style={styles.blastHeader}>
        <View style={styles.blastTitleContainer}>
          <Text style={styles.blastTitle}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.blastDescription}>{item.description}</Text>

      <View style={styles.blastDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Blast Size</Text>
          <Text style={styles.detailValue}>{item.blastSize || "N/A"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Target Area</Text>
          <Text style={styles.detailValue}>{item.targetArea || "N/A"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Holes</Text>
          <Text style={styles.detailValue}>{item.holes || 0}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Explosives</Text>
          <Text style={styles.detailValue}>{item.explosivesUsed || "N/A"}</Text>
        </View>
      </View>

      <Text style={styles.launchDate}>
// Style object property
        Launch: {formatDate(item.launchDate)}
      </Text>

      {item.status === "Completed" && !item.results && (
        <Pressable
          style={styles.recordButton}
          onPress={() =>
            navigation.navigate("RecordBlastResults", {
// Style object property
              blastId: item.id,
// Style object property
              blast: item,
            })
          }
        >
          <Text style={styles.recordButtonText}>Record Blast Results</Text>
        </Pressable>
      )}
    </Pressable>
  );

// Declare a constant or variable
  const filteredBlasts = getFilteredBlasts();

// Control flow statement
  if (loading) {
// Return JSX layout
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

// Return JSX layout
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Blast Operations Log</Text>
        <Pressable 
          onPress={handleExport} 
          disabled={exporting}
          style={styles.exportButton}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#FF9900" />
          ) : (
            <Text style={styles.exportButtonText}>PDF 📥</Text>
          )}
        </Pressable>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {["All", "Scheduled", "Completed", "Failed"].map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Blasts List */}
      {filteredBlasts.length > 0 ? (
        <FlatList
          data={filteredBlasts}
          renderItem={({ item }) => (
            <BlastItem
              blast={item}
              onPress={() => navigation.navigate("RecordBlastResults", { blast: item })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="📊"
          title="No blasts found"
          message="Blasts you create will appear here"
        />
      )}
      <FAB onPress={() => navigation.navigate("PlanEvent")} />
    </View>
  );
};

// Export the default component or module
export default BlastHistoryScreen;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  container: {
// Style object property
    flex: 1,
// Style object property
    backgroundColor: "#F8F9FA",
  },
// Style object property
  header: {
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-between",
// Style object property
    alignItems: "center",
// Style object property
    paddingHorizontal: 20,
// Style object property
    paddingTop: 50,
// Style object property
    paddingBottom: 20,
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderBottomWidth: 1,
// Style object property
    borderBottomColor: "#ECEFF1",
  },
// Style object property
  backButton: {
// Style object property
    color: "#FF9900",
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "600",
  },
// Style object property
  headerTitle: {
// Style object property
    fontSize: 18,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#ECEFF1",
  },
  exportButtonText: {
    color: "#FF9900",
    fontSize: 12,
    fontWeight: "bold",
  },
// Style object property
  filterContainer: {
// Style object property
    flexDirection: "row",
// Style object property
    paddingHorizontal: 15,
// Style object property
    paddingVertical: 12,
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderBottomWidth: 1,
// Style object property
    borderBottomColor: "#ECEFF1",
  },
// Style object property
  filterButton: {
// Style object property
    paddingHorizontal: 12,
// Style object property
    paddingVertical: 6,
// Style object property
    borderRadius: 20,
// Style object property
    backgroundColor: "#F0F0F0",
// Style object property
    marginRight: 8,
  },
// Style object property
  filterButtonActive: {
// Style object property
    backgroundColor: "#FF9900",
  },
// Style object property
  filterButtonText: {
// Style object property
    color: "#666",
// Style object property
    fontSize: 12,
// Style object property
    fontWeight: "600",
  },
// Style object property
  filterButtonTextActive: {
// Style object property
    color: "#FFF",
  },
// Style object property
  listContent: {
// Style object property
    paddingHorizontal: 15,
// Style object property
    paddingVertical: 10,
  },
// Style object property
  blastCard: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderRadius: 12,
// Style object property
    padding: 15,
// Style object property
    marginBottom: 12,
// Style object property
    borderLeftWidth: 4,
// Style object property
    borderLeftColor: "#FF9900",
// Style object property
    elevation: 2,
// Style object property
    shadowColor: "#000",
// Style object property
    shadowOffset: { width: 0, height: 1 },
// Style object property
    shadowOpacity: 0.1,
// Style object property
    shadowRadius: 3,
  },
// Style object property
  blastHeader: {
// Style object property
    marginBottom: 10,
  },
// Style object property
  blastTitleContainer: {
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-between",
// Style object property
    alignItems: "flex-start",
  },
// Style object property
  blastTitle: {
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
// Style object property
    flex: 1,
  },
// Style object property
  statusBadge: {
// Style object property
    paddingHorizontal: 10,
// Style object property
    paddingVertical: 4,
// Style object property
    borderRadius: 8,
// Style object property
    marginLeft: 10,
  },
// Style object property
  statusText: {
// Style object property
    color: "#FFF",
// Style object property
    fontSize: 11,
// Style object property
    fontWeight: "600",
  },
// Style object property
  blastDescription: {
// Style object property
    color: "#666",
// Style object property
    fontSize: 13,
// Style object property
    marginBottom: 12,
// Style object property
    lineHeight: 18,
  },
// Style object property
  blastDetails: {
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-between",
// Style object property
    backgroundColor: "#F8F9FA",
// Style object property
    borderRadius: 8,
// Style object property
    padding: 10,
// Style object property
    marginBottom: 10,
  },
// Style object property
  detailItem: {
// Style object property
    alignItems: "center",
// Style object property
    flex: 1,
  },
// Style object property
  detailLabel: {
// Style object property
    fontSize: 11,
// Style object property
    color: "#95A5A6",
// Style object property
    fontWeight: "600",
// Style object property
    marginBottom: 2,
  },
// Style object property
  detailValue: {
// Style object property
    fontSize: 14,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
  },
// Style object property
  launchDate: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#95A5A6",
// Style object property
    marginBottom: 10,
  },
// Style object property
  recordButton: {
// Style object property
    backgroundColor: "#FF9900",
// Style object property
    borderRadius: 8,
// Style object property
    paddingVertical: 8,
// Style object property
    alignItems: "center",
// Style object property
    marginTop: 5,
  },
// Style object property
  recordButtonText: {
// Style object property
    color: "#FFF",
// Style object property
    fontSize: 13,
// Style object property
    fontWeight: "600",
  },
// Style object property
  emptyState: {
// Style object property
    flex: 1,
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
  },
// Style object property
  emptyStateText: {
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
// Style object property
    marginBottom: 8,
  },
// Style object property
  emptyStateSubtext: {
// Style object property
    fontSize: 13,
// Style object property
    color: "#95A5A6",
  },
});
