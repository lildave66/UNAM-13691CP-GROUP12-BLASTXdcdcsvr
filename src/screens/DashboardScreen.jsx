import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";

import React, { useEffect, useState, useCallback } from "react";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { storage, RBAC } from "../utils/storage";
import { ExportUtils } from "../utils/export";
import { Alert } from "react-native";

import { FAB, Card, EmptyState, BlastItem, Badge } from "../components";

const DashboardScreen = () => {
  const navigation = useNavigation();

  const [userData, setUserData] = useState(null);

  const [blasts, setBlasts] = useState([]);

  const [nextBlast, setNextBlast] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [canEdit, setCanEdit] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    total: 0,

    scheduled: 0,

    completed: 0,

    failed: 0,
  });

  const [timeLeft, setTimeLeft] = useState({
    days: "00",

    hours: "00",

    mins: "00",
  });

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  useEffect(() => {
    if (!nextBlast || !nextBlast.launchDate) return;

    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [nextBlast]);

  const calculateTimeLeft = () => {
    if (!nextBlast.launchDate) return;

    const now = new Date().getTime();

    const target = new Date(nextBlast.launchDate.replace(" ", "T")).getTime();

    const difference = target - now;

    if (difference <= 0) {
      setTimeLeft({ days: "00", hours: "00", mins: "00" });
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));

    const h = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    setTimeLeft({
      days: d.toString().padStart(2, "0"),

      hours: h.toString().padStart(2, "0"),

      mins: m.toString().padStart(2, "0"),
    });
  };

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await storage.getUserData(isRefresh);
      const blastData = await storage.getBlasts(data?.companyCode, 10);

      setUserData(data);

      if (data?.companyCode) {
        const companyInfo = await storage.getCompany(data.companyCode);
        if (companyInfo) {
          setUserData((prev) => ({ ...prev, company: companyInfo }));
        }

        const isAdmin = RBAC.isCompanyAdmin(
          data.uid,
          companyInfo || data.company,
        );
        const rbacEnabled =
          companyInfo?.rbacEnabled ?? data.company?.rbacEnabled ?? true;

        const canEditBlasts =
          isAdmin || !rbacEnabled || RBAC.canEditBlasts(data.minePosition);
        setCanEdit(canEditBlasts);
      }

      setBlasts(blastData);

      const scheduled = blastData.filter((b) => b.status === "Scheduled");

      if (scheduled.length > 0) {
        setNextBlast(scheduled[0]);
      } else {
        setNextBlast(null);
      }

      setStats({
        total: blastData.length,

        scheduled: scheduled.length,

        completed: blastData.filter((b) => b.status === "Completed").length,

        failed: blastData.filter((b) => b.status === "Failed").length,
      });
    } catch (error) {
      console.error("Dashboard load failed", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, []);

  const cancelBlast = async (blastId) => {
    Alert.alert(
      "Cancel Blast",
      "Are you sure you want to cancel this scheduled blast? It will be moved to failed/unsuccessful status.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const success = await storage.recordBlastResults(
              userData?.companyCode,
              blastId,
              {
                failureReason: "Cancelled by user",
                cancelledAt: new Date().toISOString(),
              },
            );

            if (success) {
              await storage.updateBlastStatus(userData?.companyCode, blastId, "Failed");
              loadDashboardData(true);
            } else {
              Alert.alert("Error", "Failed to cancel blast.");
            }
            setLoading(false);
          },
        },
      ],
    );
  };

  const filteredBlasts = blasts.filter((blast) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [blast.title, blast.targetArea, blast.status, blast.blastSize]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const safetyScore = Math.max(
    0,
    Math.min(100, 100 - stats.failed * 12 + stats.completed * 4),
  );
  const safetyLevel =
    safetyScore >= 85
      ? "Excellent"
      : safetyScore >= 65
        ? "Stable"
        : "Needs review";
  const recommendedAction =
    stats.failed > 0
      ? "Review failed blasts before the next schedule."
      : stats.scheduled > 0
        ? "Confirm schedule and field readiness for the next blast."
        : "Start by creating your first blast plan.";

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
        "Recent Operations",
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleDateString(undefined, {
      month: "short",

      day: "numeric",
    });
  };

  if (loading && !userData) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9900"]}
            tintColor="#FF9900"
          />
        }
      >
        {}
        {nextBlast ? (
          <Card style={styles.timerCard}>
            <Text style={styles.timerLabel}>NEXT BLAST: {nextBlast.title}</Text>
            <Text style={styles.timeLeftLabel}>Time left:</Text>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.launchDateText}>
                  Scheduled: {nextBlast.launchDate || "TBD"}
                </Text>
                <Text style={styles.creatorText}>
                  Set by: {nextBlast.createdByName || "Unknown user"}
                </Text>
              </View>
              {canEdit && (
                <Pressable
                  onPress={() => cancelBlast(nextBlast.id)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel Blast</Text>
                </Pressable>
              )}
            </View>
          </Card>
        ) : (
          <EmptyState
            icon="⏲️"
            title="No Active Blast Timers"
            message="Schedule a blast operation to begin countdown"
          />
        )}

        {}
        <Card style={styles.insightCard}>
          <Text style={styles.insightLabel}>Smart Safety Overview</Text>
          <Text style={styles.insightTitle}>
            Safety score: {safetyScore}% · {safetyLevel}
          </Text>
          <Text style={styles.insightText}>{recommendedAction}</Text>
        </Card>

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

        {}
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

        {}
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
          <Text style={styles.helperText}>
            Search by title, area, or status
          </Text>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search blasts"
            placeholderTextColor="#95A5A6"
          />
          {filteredBlasts.length === 0 ? (
            <EmptyState
              title="No blast operations recorded yet."
              style={styles.emptyState}
            />
          ) : (
            filteredBlasts.map((blast) => (
              <BlastItem
                key={blast.id}
                blast={blast}
                onPress={() =>
                  navigation.navigate("RecordBlastResults", { blast })
                }
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

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: {
    backgroundColor: "#1A1F3A",

    paddingTop: 50,

    paddingBottom: 20,

    paddingHorizontal: 20,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#FF9900", flex: 1 },

  headerSubtitle: {
    fontSize: 13,
    color: "#FFF",
    marginTop: 2,
    fontWeight: "500",
  },

  profileIcon: {
    backgroundColor: "rgba(255,255,255,0.1)",

    padding: 8,

    borderRadius: 20,
  },

  profileText: { fontSize: 18 },

  content: { flex: 1, padding: 15 },

  timerCard: {
    backgroundColor: "#1A1F3A",

    borderRadius: 20,

    padding: 25,

    alignItems: "center",

    marginBottom: 20,

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 10 },

    shadowOpacity: 0.3,

    shadowRadius: 20,

    elevation: 10,
  },

  timerLabel: {
    color: "#FF9900",

    fontWeight: "bold",

    fontSize: 12,

    letterSpacing: 1,

    marginBottom: 15,
  },

  blastDetails: {
    flexDirection: "row",

    justifyContent: "space-around",

    width: "100%",

    marginBottom: 15,

    paddingVertical: 10,

    borderTopWidth: 1,

    borderBottomWidth: 1,

    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  blastDetailsText: {
    color: "#FFB84D",

    fontSize: 12,

    fontWeight: "600",
  },

  countdownContainer: { flexDirection: "row", alignItems: "center", gap: 10 },

  timeBox: { alignItems: "center" },

  timeValue: { color: "#FFF", fontSize: 36, fontWeight: "bold" },

  timeUnit: { color: "#95A5A6", fontSize: 10, marginTop: -5 },

  timeDivider: {
    color: "#FFF",

    fontSize: 24,

    fontWeight: "bold",

    marginTop: -15,
  },

  launchDateText: { color: "#95A5A6", fontSize: 12, marginTop: 20 },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },

  creatorText: {
    color: "#FFB84D",
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },

  emptyTimerCard: {
    padding: 30,

    backgroundColor: "#FFF",

    borderRadius: 20,

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ECF0F1",

    marginBottom: 20,
  },

  emptyTimerText: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },

  emptyTimerSub: {
    fontSize: 12,

    color: "#95A5A6",

    marginTop: 5,

    textAlign: "center",
  },

  insightCard: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  insightLabel: {
    color: "#FFB84D",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  insightTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  insightText: { color: "#E5E7EB", fontSize: 13, marginTop: 6, lineHeight: 18 },
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },

  statCard: {
    flex: 1,

    borderRadius: 15,

    padding: 15,

    justifyContent: "center",

    alignItems: "center",
  },

  statNumber: { fontSize: 20, fontWeight: "bold", color: "#FFF" },

  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  section: { marginBottom: 20 },

  helperText: { color: "#95A5A6", fontSize: 11 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ECEFF1",
    borderRadius: 12,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#1A1F3A",
  },
  sectionTitle: {
    fontSize: 16,

    fontWeight: "bold",

    color: "#2C3E50",

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

  actionButton: {
    flexDirection: "row",

    borderRadius: 12,

    padding: 18,

    marginBottom: 10,

    alignItems: "center",

    gap: 12,
  },

  buttonRow: {
    flexDirection: "row",

    gap: 10,
  },

  readOnlyButtonRow: {
    gap: 10,
  },

  actionButtonHalf: {
    flex: 1,

    marginBottom: 0,
  },

  readOnlyNote: {
    fontSize: 11,

    color: "#FF9900",

    fontStyle: "italic",

    marginTop: 5,
  },

  actionButtonText: { fontSize: 14, fontWeight: "bold", color: "#FFF" },

  actionButtonIcon: { fontSize: 20 },

  historyItem: {
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

  historyStatus: {
    width: 35,

    height: 35,

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",
  },

  historyStatusIcon: { fontSize: 16 },

  historyTitle: { fontSize: 14, fontWeight: "bold", color: "#2C3E50" },

  historySubtitle: { fontSize: 12, color: "#FF9900", marginTop: 2 },

  historyTime: { fontSize: 11, color: "#95A5A6", marginTop: 1 },

  badge: {
    backgroundColor: "#F8F9FA",

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,
  },

  badgeText: { fontSize: 10, fontWeight: "bold", color: "#95A5A6" },

  emptyState: { padding: 30, alignItems: "center" },

  emptyStateText: { color: "#95A5A6", fontSize: 14 },

  timeLeftLabel: {
    color: "#95A5A6",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },

  cancelButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-end",
  },

  cancelButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
