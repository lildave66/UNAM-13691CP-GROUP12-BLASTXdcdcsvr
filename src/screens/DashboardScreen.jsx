/*
 * File: src\screens\DashboardScreen.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
// Import project dependencies
import React, { useEffect, useState, useCallback } from "react";
// Import project dependencies
import { useNavigation, useFocusEffect } from "@react-navigation/native";
// Import project dependencies
import { storage, RBAC } from "../utils/storage";
import { ExportUtils } from "../utils/export";
import { Alert } from "react-native";
// Import project dependencies
import { 
  FAB, 
  Card, 
  EmptyState, 
  BlastItem, 
  Badge 
} from "../components";

// Define a function or component using an arrow function
const DashboardScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();
// Declare a constant or variable
  const [userData, setUserData] = useState(null);
// Declare a constant or variable
  const [blasts, setBlasts] = useState([]);
// Declare a constant or variable
  const [nextBlast, setNextBlast] = useState(null);
// Declare a constant or variable
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
// Declare a constant or variable
  const [canEdit, setCanEdit] = useState(true);
// Declare a constant or variable
  const [stats, setStats] = useState({
// Style object property
    total: 0,
// Style object property
    scheduled: 0,
// Style object property
    completed: 0,
// Style object property
    failed: 0,
  });

// Declare a constant or variable
  const [timeLeft, setTimeLeft] = useState({
// Style object property
    days: "00",
// Style object property
    hours: "00",
// Style object property
    mins: "00",
  });

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  // Timer Effect
  useEffect(() => {
// Control flow statement
    if (!nextBlast || !nextBlast.launchDate) return;

// Define a function or component using an arrow function
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

// Return JSX layout
    return () => clearInterval(timer);
  }, [nextBlast]);

// Define a function or component using an arrow function
  const calculateTimeLeft = () => {
// Control flow statement
    if (!nextBlast.launchDate) return;

// Declare a constant or variable
    const now = new Date().getTime();
// Declare a constant or variable
    const target = new Date(nextBlast.launchDate.replace(" ", "T")).getTime();
// Declare a constant or variable
    const difference = target - now;

// Control flow statement
    if (difference <= 0) {
      setTimeLeft({ days: "00", hours: "00", mins: "00" });
      return;
    }

// Declare a constant or variable
    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
// Declare a constant or variable
    const h = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
// Declare a constant or variable
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    setTimeLeft({
// Style object property
      days: d.toString().padStart(2, "0"),
// Style object property
      hours: h.toString().padStart(2, "0"),
// Style object property
      mins: m.toString().padStart(2, "0"),
    });
  };

// Define a function or component using an arrow function
  const loadDashboardData = async () => {
    setLoading(true);
// Declare a constant or variable
    const data = await storage.getUserData();
    const blastData = await storage.getBlasts(data?.companyCode, 10); // Quota optimization: only fetch latest 10

    setUserData(data);

// Fetch fresh company data to ensure name is synchronized
    if (data?.companyCode) {
      const companyInfo = await storage.getCompany(data.companyCode);
      if (companyInfo) {
        setUserData(prev => ({ ...prev, company: companyInfo }));
      }
      
      const isAdmin = RBAC.isCompanyAdmin(data.uid, companyInfo || data.company);
      const rbacEnabled = companyInfo?.rbacEnabled ?? data.company?.rbacEnabled ?? true;
      
      // Check if user can edit: Admin can always edit, otherwise check role if RBAC is enabled
      const canEditBlasts = isAdmin || !rbacEnabled || RBAC.canEditBlasts(data.minePosition);
      setCanEdit(canEditBlasts);
    }

    setBlasts(blastData);

// Declare a constant or variable
    const scheduled = blastData.filter((b) => b.status === "Scheduled");
// Control flow statement
    if (scheduled.length > 0) {
      setNextBlast(scheduled[0]);
    } else {
      setNextBlast(null);
    }

    setStats({
// Style object property
      total: blastData.length,
// Style object property
      scheduled: scheduled.length,
// Style object property
      completed: blastData.filter((b) => b.status === "Completed").length,
// Style object property
      failed: blastData.filter((b) => b.status === "Failed").length,
    });
    setLoading(false);
  };

  const handleExport = async () => {
    if (blasts.length === 0) {
      Alert.alert("No Data", "There are no blast operations to export.");
      return;
    }

    setExporting(true);
    try {
      await ExportUtils.generateBlastReport(
        blasts,
        userData?.company,
        "Recent Operations"
      );
    } catch (error) {
      console.error("Export failed", error);
      Alert.alert("Export Failed", "Could not generate PDF report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

// Define a function or component using an arrow function
  const formatDate = (dateString) => {
// Control flow statement
    if (!dateString) return "N/A";
// Declare a constant or variable
    const date = new Date(dateString);
// Return a value from the function
    return date.toLocaleDateString(undefined, {
// Style object property
      month: "short",
// Style object property
      day: "numeric",
    });
  };

// Control flow statement
  if (loading && !userData) {
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            🧞 {userData?.company?.name || "Mine Blast Operations"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {userData?.minePosition || "User"}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileIcon}
        >
          <Text style={styles.profileText}>👤</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Countdown Timer Section */}
        {nextBlast ? (
          <Card style={styles.timerCard}>
            <Text style={styles.timerLabel}>
              NEXT BLAST: {nextBlast.title}
            </Text>
            <View style={styles.blastDetails}>
              <Text style={styles.blastDetailsText}>
                📍 {nextBlast.targetArea}
              </Text>
              <Text style={styles.blastDetailsText}>
                ⚡ {nextBlast.blastSize} kg
              </Text>
            </View>
            <View style={styles.countdownContainer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeLeft.days}</Text>
                <Text style={styles.timeUnit}>Days</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeLeft.hours}</Text>
                <Text style={styles.timeUnit}>Hrs</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeLeft.mins}</Text>
                <Text style={styles.timeUnit}>Mins</Text>
              </View>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.launchDateText}>
                Scheduled: {nextBlast.launchDate || "TBD"}
              </Text>
              {nextBlast.createdByName && (
                <Text style={styles.creatorText}>
                  By: {nextBlast.createdByName}
                </Text>
              )}
            </View>
          </Card>
        ) : (
          <EmptyState 
            icon="⏲️" 
            title="No Active Blast Timers" 
            message="Schedule a blast operation to begin countdown"
            style={styles.emptyTimerCard}
          />
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: "#FF9900" }]}>
            <Text style={styles.statNumber}>{stats.scheduled}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#2ECC71" }]}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* Action Buttons - Show plan only if user can edit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💣 Blast Control</Text>
          {canEdit ? (
            <View style={styles.buttonRow}>
              <Pressable
                style={[
                  styles.actionButton,
                  styles.actionButtonHalf,
                  { backgroundColor: "#2ECC71" },
                ]}
                onPress={() => navigation.navigate("PlanEvent")}
              >
                <Text style={styles.actionButtonIcon}>📅</Text>
                <Text style={styles.actionButtonText}>Plan Blast</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.actionButton,
                  styles.actionButtonHalf,
                  { backgroundColor: "#3498DB" },
                ]}
                onPress={() => navigation.navigate("BlastHistory")}
              >
                <Text style={styles.actionButtonIcon}>📊</Text>
                <Text style={styles.actionButtonText}>History</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.readOnlyButtonRow}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: "#3498DB" }]}
                onPress={() => navigation.navigate("BlastHistory")}
              >
                <Text style={styles.actionButtonIcon}>📊</Text>
                <Text style={styles.actionButtonText}>View Blast History</Text>
              </Pressable>
              <Text style={styles.readOnlyNote}>
                Your position ({userData?.minePosition}) cannot create new
                blasts
              </Text>
            </View>
          )}
        </View>

        {/* Recent Blast History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📋 Recent Blast Operations</Text>
            <Pressable 
              onPress={handleExport} 
              disabled={exporting}
              style={styles.inlineExportButton}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#FF9900" />
              ) : (
                <Text style={styles.inlineExportText}>Export PDF 📥</Text>
              )}
            </Pressable>
          </View>
          {blasts.length === 0 ? (
            <EmptyState 
              title="No blast operations recorded yet." 
              style={styles.emptyState}
            />
          ) : (
            blasts.map((blast) => (
              <BlastItem 
                key={blast.id} 
                blast={blast} 
                onPress={() => navigation.navigate("RecordBlastResults", { blast })}
              />
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <FAB onPress={() => navigation.navigate("PlanEvent")} />
    </View>
  );
};

// Export the default component or module
export default DashboardScreen;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  container: { flex: 1, backgroundColor: "#F8F9FA" },
// Style object property
  header: {
// Style object property
    backgroundColor: "#1A1F3A",
// Style object property
    paddingTop: 50,
// Style object property
    paddingBottom: 20,
// Style object property
    paddingHorizontal: 20,
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-between",
// Style object property
    alignItems: "center",
  },
// Style object property
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#FF9900", flex: 1 },
// Style object property
  headerSubtitle: { fontSize: 13, color: "#FFF", marginTop: 2, fontWeight: "500" },
// Style object property
  profileIcon: {
// Style object property
    backgroundColor: "rgba(255,255,255,0.1)",
// Style object property
    padding: 8,
// Style object property
    borderRadius: 20,
  },
// Style object property
  profileText: { fontSize: 18 },
// Style object property
  content: { flex: 1, padding: 15 },
// Style object property
  timerCard: {
// Style object property
    backgroundColor: "#1A1F3A",
// Style object property
    borderRadius: 20,
// Style object property
    padding: 25,
// Style object property
    alignItems: "center",
// Style object property
    marginBottom: 20,
// Style object property
    shadowColor: "#000",
// Style object property
    shadowOffset: { width: 0, height: 10 },
// Style object property
    shadowOpacity: 0.3,
// Style object property
    shadowRadius: 20,
// Style object property
    elevation: 10,
  },
// Style object property
  timerLabel: {
// Style object property
    color: "#FF9900",
// Style object property
    fontWeight: "bold",
// Style object property
    fontSize: 12,
// Style object property
    letterSpacing: 1,
// Style object property
    marginBottom: 15,
  },
// Style object property
  blastDetails: {
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-around",
// Style object property
    width: "100%",
// Style object property
    marginBottom: 15,
// Style object property
    paddingVertical: 10,
// Style object property
    borderTopWidth: 1,
// Style object property
    borderBottomWidth: 1,
// Style object property
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
// Style object property
  blastDetailsText: {
// Style object property
    color: "#FFB84D",
// Style object property
    fontSize: 12,
// Style object property
    fontWeight: "600",
  },
// Style object property
  countdownContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
// Style object property
  timeBox: { alignItems: "center" },
// Style object property
  timeValue: { color: "#FFF", fontSize: 36, fontWeight: "bold" },
// Style object property
  timeUnit: { color: "#95A5A6", fontSize: 10, marginTop: -5 },
// Style object property
  timeDivider: {
// Style object property
    color: "#FFF",
// Style object property
    fontSize: 24,
// Style object property
    fontWeight: "bold",
// Style object property
    marginTop: -15,
  },
// Style object property
  launchDateText: { color: "#95A5A6", fontSize: 12, marginTop: 20 },
// Style object property
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
// Style object property
  creatorText: {
    color: "#FFB84D",
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },
// Style object property
  emptyTimerCard: {
// Style object property
    padding: 30,
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderRadius: 20,
// Style object property
    alignItems: "center",
// Style object property
    borderWidth: 1,
// Style object property
    borderColor: "#ECF0F1",
// Style object property
    marginBottom: 20,
  },
// Style object property
  emptyTimerText: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
// Style object property
  emptyTimerSub: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#95A5A6",
// Style object property
    marginTop: 5,
// Style object property
    textAlign: "center",
  },
// Style object property
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
// Style object property
  statCard: {
// Style object property
    flex: 1,
// Style object property
    borderRadius: 15,
// Style object property
    padding: 15,
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
  },
// Style object property
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
// Style object property
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
// Style object property
  section: { marginBottom: 20 },
// Style object property
  sectionTitle: {
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#2C3E50",
// Style object property
    marginBottom: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inlineExportButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F0F0F0",
  },
  inlineExportText: {
    color: "#FF9900",
    fontSize: 11,
    fontWeight: "bold",
  },
// Style object property
  actionButton: {
// Style object property
    flexDirection: "row",
// Style object property
    borderRadius: 12,
// Style object property
    padding: 18,
// Style object property
    marginBottom: 10,
// Style object property
    alignItems: "center",
// Style object property
    gap: 12,
  },
// Style object property
  buttonRow: {
// Style object property
    flexDirection: "row",
// Style object property
    gap: 10,
  },
// Style object property
  readOnlyButtonRow: {
// Style object property
    gap: 10,
  },
// Style object property
  actionButtonHalf: {
// Style object property
    flex: 1,
// Style object property
    marginBottom: 0,
  },
// Style object property
  readOnlyNote: {
// Style object property
    fontSize: 11,
// Style object property
    color: "#FF9900",
// Style object property
    fontStyle: "italic",
// Style object property
    marginTop: 5,
  },
// Style object property
  actionButtonText: { fontSize: 14, fontWeight: "bold", color: "#FFF" },
// Style object property
  actionButtonIcon: { fontSize: 20 },
// Style object property
  historyItem: {
// Style object property
    flexDirection: "row",
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderRadius: 12,
// Style object property
    padding: 15,
// Style object property
    marginBottom: 10,
// Style object property
    alignItems: "center",
// Style object property
    gap: 12,
// Style object property
    borderWidth: 1,
// Style object property
    borderColor: "#ECF0F1",
  },
// Style object property
  historyStatus: {
// Style object property
    width: 35,
// Style object property
    height: 35,
// Style object property
    borderRadius: 10,
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
  },
// Style object property
  historyStatusIcon: { fontSize: 16 },
// Style object property
  historyTitle: { fontSize: 14, fontWeight: "bold", color: "#2C3E50" },
// Style object property
  historySubtitle: { fontSize: 12, color: "#FF9900", marginTop: 2 },
// Style object property
  historyTime: { fontSize: 11, color: "#95A5A6", marginTop: 1 },
// Style object property
  badge: {
// Style object property
    backgroundColor: "#F8F9FA",
// Style object property
    paddingHorizontal: 8,
// Style object property
    paddingVertical: 4,
// Style object property
    borderRadius: 6,
  },
// Style object property
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#95A5A6" },
// Style object property
  emptyState: { padding: 30, alignItems: "center" },
// Style object property
  emptyStateText: { color: "#95A5A6", fontSize: 14 },
});
