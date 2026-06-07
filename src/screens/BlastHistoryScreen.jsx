import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";

import React, { useEffect, useState, useCallback } from "react";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { storage } from "../utils/storage";
import { ExportUtils } from "../utils/export";

import { FAB, Card, EmptyState, BlastItem } from "../components";

const BlastHistoryScreen = () => {
  const navigation = useNavigation();

  const [blasts, setBlasts] = useState([]);
  const [userData, setUserData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadBlastHistory();
    }, []),
  );

  const loadBlastHistory = async () => {
    setLoading(true);
    try {
      const data = await storage.getUserData();
      setUserData(data);
      const allBlasts = await storage.getBlasts(data?.companyCode, 100);
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
      Alert.alert(
        "No Data",
        "There are no blast operations to export with the current filter.",
      );
      return;
    }

    setExporting(true);
    try {
      await ExportUtils.generateBlastReport(
        getFilteredBlasts(),
        userData?.company,
        filterStatus,
      );
    } catch (error) {
      console.error("Export failed", error);
      Alert.alert(
        "Export Failed",
        "Could not generate PDF report. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  const getFilteredBlasts = () => {
    const lower = searchTerm.trim().toLowerCase();
    const byStatus =
      filterStatus === "All"
        ? blasts
        : blasts.filter((b) => b.status === filterStatus);

    if (!lower) return byStatus;

    return byStatus.filter((b) =>
      [b.title, b.targetArea, b.status, b.blastSize, b.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "#FF9900";

      case "Completed":
        return "#27AE60";

      case "Failed":
        return "#E74C3C";

      default:
        return "#95A5A6";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString.replace(" ", "T"));

      return date.toLocaleDateString(undefined, {
        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

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
        Launch: {formatDate(item.launchDate)}
      </Text>

      {item.status === "Completed" && !item.results && (
        <Pressable
          style={styles.recordButton}
          onPress={() =>
            navigation.navigate("RecordBlastResults", {
              blastId: item.id,

              blast: item,
            })
          }
        >
          <Text style={styles.recordButtonText}>Record Blast Results</Text>
        </Pressable>
      )}
    </Pressable>
  );

  const filteredBlasts = getFilteredBlasts();

  if (loading && blasts.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
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

      {}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by title, area, or status"
          placeholderTextColor="#95A5A6"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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
        </ScrollView>
      </View>

      {}
      {filteredBlasts.length > 0 ? (
        <FlatList
          data={filteredBlasts}
          renderItem={({ item }) => (
            <BlastItem
              blast={item}
              onPress={() =>
                navigation.navigate("RecordBlastResults", { blast: item })
              }
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

export default BlastHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#F8F9FA",
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 20,

    paddingTop: 50,

    paddingBottom: 20,

    backgroundColor: "#FFF",

    borderBottomWidth: 1,

    borderBottomColor: "#ECEFF1",
  },

  backButtonContainer: {
    padding: 5,
  },

  backButton: {
    color: "#FF9900",

    fontSize: 16,

    fontWeight: "600",
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: "bold",

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

  filterContainer: {
    paddingHorizontal: 15,

    paddingVertical: 12,

    backgroundColor: "#FFF",

    borderBottomWidth: 1,

    borderBottomColor: "#ECEFF1",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ECEFF1",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: "#1A1F3A",
  },

  filterScroll: {
    flexDirection: 'row',
  },

  filterButton: {
    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: "#F0F0F0",

    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: "#FF9900",
  },

  filterButtonText: {
    color: "#666",

    fontSize: 12,

    fontWeight: "600",
  },

  filterButtonTextActive: {
    color: "#FFF",
  },

  listContent: {
    paddingHorizontal: 15,

    paddingVertical: 10,
  },

  blastCard: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 15,

    marginBottom: 12,

    borderLeftWidth: 4,

    borderLeftColor: "#FF9900",

    elevation: 2,

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.1,

    shadowRadius: 3,
  },

  blastHeader: {
    marginBottom: 10,
  },

  blastTitleContainer: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  blastTitle: {
    fontSize: 16,

    fontWeight: "bold",

    color: "#1A1F3A",

    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 8,

    marginLeft: 10,
  },

  statusText: {
    color: "#FFF",

    fontSize: 11,

    fontWeight: "600",
  },

  blastDescription: {
    color: "#666",

    fontSize: 13,

    marginBottom: 12,

    lineHeight: 18,
  },

  blastDetails: {
    flexDirection: "row",

    justifyContent: "space-between",

    backgroundColor: "#F8F9FA",

    borderRadius: 8,

    padding: 10,

    marginBottom: 10,
  },

  detailItem: {
    alignItems: "center",

    flex: 1,
  },

  detailLabel: {
    fontSize: 11,

    color: "#95A5A6",

    fontWeight: "600",

    marginBottom: 2,
  },

  detailValue: {
    fontSize: 14,

    fontWeight: "bold",

    color: "#1A1F3A",
  },

  launchDate: {
    fontSize: 12,

    color: "#95A5A6",

    marginBottom: 10,
  },

  recordButton: {
    backgroundColor: "#FF9900",

    borderRadius: 8,

    paddingVertical: 8,

    alignItems: "center",

    marginTop: 5,
  },

  recordButtonText: {
    color: "#FFF",

    fontSize: 13,

    fontWeight: "600",
  },

  emptyState: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  emptyStateText: {
    fontSize: 16,

    fontWeight: "bold",

    color: "#1A1F3A",

    marginBottom: 8,
  },

  emptyStateSubtext: {
    fontSize: 13,

    color: "#95A5A6",
  },
});
