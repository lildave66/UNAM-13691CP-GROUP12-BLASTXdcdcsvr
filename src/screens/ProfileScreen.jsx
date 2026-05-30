/*
 * File: src\screens\ProfileScreen.jsx
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
  Alert,
  ActivityIndicator,
  FlatList,
  Switch,
} from "react-native";
// Import project dependencies
import React, { useEffect, useState } from "react";
// Import project dependencies
import { useNavigation } from "@react-navigation/native";
// Import project dependencies
import { storage, RBAC } from "../utils/storage";
// Import project dependencies
import { authHelpers } from "../utils/firebase";

// Define a function or component using an arrow function
const ProfileScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();
// Declare a constant or variable
  const [userData, setUserData] = useState(null);
// Declare a constant or variable
  const [teammates, setTeammates] = useState([]);
// Declare a constant or variable
  const [companySettings, setCompanySettings] = useState(null);
// Declare a constant or variable
  const [loading, setLoading] = useState(true);
// Declare a constant or variable
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
// Declare a constant or variable
  const [rbacEnabled, setRbacEnabled] = useState(true);
// Declare a constant or variable
  const [togglingRBAC, setTogglingRBAC] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

// Define a function or component using an arrow function
  const loadProfileData = async () => {
    setLoading(true);
// Declare a constant or variable
    const data = await storage.getUserData();
    setUserData(data);

// Control flow statement
    if (data) {
      const team = await storage.getTeammates(data.companyCode);
      setTeammates(team);

// Fetch fresh company data to ensure name is synchronized
      const companyInfo = await storage.getCompany(data.companyCode);
      if (companyInfo) {
        setUserData(prev => ({ ...prev, company: companyInfo }));
      }

// Declare a constant or variable
      const settings = await storage.getCompanySettings(data.companyCode);
      setCompanySettings(settings);

      // Check if user is company admin
// Declare a constant or variable
      const isAdmin = RBAC.isCompanyAdmin(data.uid, companyInfo || data.company);
      setIsCompanyAdmin(isAdmin);
      setRbacEnabled(companyInfo?.rbacEnabled ?? data.company?.rbacEnabled ?? true);
    }
    setLoading(false);
  };

// Define a function or component using an arrow function
  const handleToggleRBAC = async () => {
// Control flow statement
    if (!isCompanyAdmin) {
      Alert.alert(
        "Permission Denied",
        "Only the company administrator can change RBAC settings.",
      );
      return;
    }

    setTogglingRBAC(true);
// Declare a constant or variable
    const newRBACState = !rbacEnabled;
// Control flow statement
    try {
// Wait for an asynchronous operation
      await storage.toggleRBAC(
        userData.companyCode,
        newRBACState,
        userData.uid,
      );
      setRbacEnabled(newRBACState);
      Alert.alert(
        "Settings Updated",
        `Role-Based Access Control is now ${newRBACState ? "ENABLED" : "DISABLED"}. ${
          newRBACState
            ? "Only Engineers, Specialists, and Analysts can edit records."
            : "All team members can edit records."
        }`,
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update RBAC settings");
    } finally {
      setTogglingRBAC(false);
    }
  };

// Define a function or component using an arrow function
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? This will clear your local cache.",
      [
        { text: "Cancel", style: "cancel" },
        {
// Style object property
          text: "Logout",
// Style object property
          onPress: async () => {
// Wait for an asynchronous operation
            await storage.clearAll();
            await authHelpers.signOutUser();
          },
// Style object property
          style: "destructive",
        },
      ],
    );
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Mine</Text>
        <Pressable
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Dashboard</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.userName}>{userData?.name || "User"}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>

          {/* Mine Position Badge */}
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}> {userData?.minePosition}</Text>
          </View>

          {/* User Stats */}
          <View style={styles.userStatsContainer}>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>
                {RBAC.canEditBlasts(userData?.minePosition) ? "✓" : "•"}
              </Text>
              <Text style={styles.userStatLabel}>
                {RBAC.canEditBlasts(userData?.minePosition)
                  ? "Can Edit"
                  : "Read-Only"}
              </Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>{teammates.length}</Text>
              <Text style={styles.userStatLabel}>Team Members</Text>
            </View>
          </View>
        </View>

        {/* Company Card */}
        <View style={styles.companyCard}>
          <View style={styles.companyHeader}>
            <Text style={styles.companySectionTitle}>Mining Operation</Text>
            {isCompanyAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
          <Text style={styles.companyName}>{userData?.company?.name}</Text>
          <Text style={styles.companyDetail}>
            Code:{" "}
            <Text style={styles.companyCodeHighlight}>
              {userData?.companyCode}
            </Text>
          </Text>
          <Text style={styles.companyDetail}>
            Type: {userData?.company?.mineType}
          </Text>
          <Text style={styles.companyDetail}>
            Location: {userData?.company?.location}
          </Text>
        </View>

        {/* RBAC Settings - Only for Admin */}
        {isCompanyAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Access Control Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>
                    Role-Based Access Control
                  </Text>
                  <Text style={styles.settingDescription}>
                    {rbacEnabled
                      ? "Only Engineers, Specialists, and Analysts can edit records. Others view-only."
                      : "All team members can edit records."}
                  </Text>
                </View>
                <Switch
                  value={rbacEnabled}
                  onValueChange={handleToggleRBAC}
                  disabled={togglingRBAC}
                  trackColor={{ false: "#E0E0E0", true: "#FFB84D" }}
                  thumbColor={rbacEnabled ? "#FF9900" : "#F1F1F1"}
                  style={{ marginLeft: 10 }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Team Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
               Team Members ({teammates.length})
            </Text>
            {isCompanyAdmin && (
              <Pressable
                onPress={() => navigation.navigate("AdminSettings")}
                style={styles.manageButton}
              >
                <Text style={styles.manageButtonText}>Manage Team</Text>
              </Pressable>
            )}
          </View>
          {teammates.length > 0 ? (
            teammates.map((member, index) => (
              <View key={index} style={styles.teammateItem}>
                <View style={styles.teammateAvatar}>
                  <Text style={styles.teammateInitial}>
                    {member.name?.charAt(0) || "U"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.teammateName}>{member.name}</Text>
                  <Text style={styles.teammateMinePosition}>
                    {member.minePosition}
                  </Text>
                  <Text style={styles.teammateEmail}>{member.email}</Text>
                </View>
                <View
                  style={[
                    styles.teammateBadge,
                    RBAC.canEditBlasts(member.minePosition)
                      ? styles.editorBadge
                      : styles.viewerBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.teammateBadgeText,
                      RBAC.canEditBlasts(member.minePosition)
                        ? styles.editorBadgeText
                        : styles.viewerBadgeText,
                    ]}
                  >
                    {RBAC.canEditBlasts(member.minePosition)
                      ? "Editor"
                      : "Viewer"}
                  </Text>
                </View>
                {member.uid === userData?.uid && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youText}>YOU</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No team members yet</Text>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Account</Text>
          <Pressable style={styles.settingsItem} onPress={handleLogout}>
            <Text style={styles.settingsItemIcon}>🚪</Text>
            <Text style={[styles.settingsItemTitle, { color: "#E74C3C" }]}>
              Logout from Mine Blast
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Export the default component or module
export default ProfileScreen;

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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
// Style object property
  backButton: {
// Style object property
    backgroundColor: "rgba(255,255,255,0.1)",
// Style object property
    paddingHorizontal: 10,
// Style object property
    paddingVertical: 6,
// Style object property
    borderRadius: 15,
  },
// Style object property
  backButtonText: { color: "#FFF", fontSize: 12 },
// Style object property
  content: { flex: 1, padding: 15 },
// Style object property
  profileCard: {
// Style object property
    backgroundColor: "#FFF",
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
    shadowOffset: { width: 0, height: 2 },
// Style object property
    shadowOpacity: 0.05,
// Style object property
    elevation: 2,
  },
// Style object property
  avatarContainer: {
// Style object property
    width: 70,
// Style object property
    height: 70,
// Style object property
    borderRadius: 35,
// Style object property
    backgroundColor: "#F0F3F4",
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
// Style object property
    marginBottom: 15,
  },
// Style object property
  avatar: { fontSize: 30 },
// Style object property
  userName: { fontSize: 20, fontWeight: "bold", color: "#2C3E50" },
// Style object property
  userEmail: { fontSize: 14, color: "#95A5A6", marginTop: 5 },
// Style object property
  positionBadge: {
// Style object property
    backgroundColor: "#FFE8CC",
// Style object property
    paddingHorizontal: 12,
// Style object property
    paddingVertical: 6,
// Style object property
    borderRadius: 20,
// Style object property
    marginTop: 12,
  },
// Style object property
  positionText: {
// Style object property
    fontSize: 13,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#E67E22",
  },
// Style object property
  userStatsContainer: {
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-around",
// Style object property
    width: "100%",
// Style object property
    borderTopWidth: 1,
// Style object property
    borderTopColor: "#ECF0F1",
// Style object property
    paddingTop: 20,
// Style object property
    marginTop: 20,
  },
// Style object property
  userStat: { alignItems: "center" },
// Style object property
  userStatValue: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
// Style object property
  userStatLabel: { fontSize: 11, color: "#95A5A6", marginTop: 3 },
// Style object property
  companyCard: {
// Style object property
    backgroundColor: "#E8F7FF",
// Style object property
    borderRadius: 15,
// Style object property
    padding: 15,
// Style object property
    marginBottom: 20,
// Style object property
    borderLeftWidth: 4,
// Style object property
    borderLeftColor: "#3498DB",
  },
// Style object property
  companyHeader: {
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-between",
// Style object property
    alignItems: "center",
// Style object property
    marginBottom: 10,
  },
// Style object property
  companySectionTitle: {
// Style object property
    fontSize: 14,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#2C3E50",
  },
// Style object property
  adminBadge: {
// Style object property
    backgroundColor: "#FFD700",
// Style object property
    paddingHorizontal: 8,
// Style object property
    paddingVertical: 4,
// Style object property
    borderRadius: 6,
  },
// Style object property
  adminBadgeText: {
// Style object property
    fontSize: 10,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#E67E22",
  },
// Style object property
  companyName: { fontSize: 16, fontWeight: "bold", color: "#0C5460" },
// Style object property
  companyDetail: { fontSize: 12, color: "#0C5460", marginTop: 5 },
// Style object property
  companyCodeHighlight: { fontWeight: "bold", color: "#FF9900" },
// Style object property
  section: { marginBottom: 25 },
// Style object property
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
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
// Style object property
    marginLeft: 5,
  },
// Style object property
  manageButton: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9900",
  },
// Style object property
  manageButtonText: {
    color: "#FF9900",
    fontSize: 12,
    fontWeight: "bold",
  },
// Style object property
  settingsCard: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderRadius: 12,
// Style object property
    padding: 15,
  },
// Style object property
  settingRow: {
// Style object property
    flexDirection: "row",
// Style object property
    alignItems: "center",
// Style object property
    justifyContent: "space-between",
  },
// Style object property
  settingLabel: {
// Style object property
    fontSize: 14,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#2C3E50",
  },
// Style object property
  settingDescription: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#95A5A6",
// Style object property
    marginTop: 5,
  },
// Style object property
  teammateItem: {
// Style object property
    flexDirection: "row",
// Style object property
    alignItems: "center",
// Style object property
    backgroundColor: "#FFF",
// Style object property
    padding: 12,
// Style object property
    borderRadius: 12,
// Style object property
    marginBottom: 8,
// Style object property
    gap: 12,
  },
// Style object property
  teammateAvatar: {
// Style object property
    width: 40,
// Style object property
    height: 40,
// Style object property
    borderRadius: 20,
// Style object property
    backgroundColor: "#1A1F3A",
// Style object property
    justifyContent: "center",
// Style object property
    alignItems: "center",
  },
// Style object property
  teammateInitial: { color: "#FFF", fontWeight: "bold" },
// Style object property
  teammateName: { fontSize: 14, fontWeight: "600", color: "#2C3E50" },
// Style object property
  teammateMinePosition: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#FF9900",
// Style object property
    fontWeight: "600",
  },
// Style object property
  teammateEmail: { fontSize: 11, color: "#95A5A6" },
// Style object property
  teammateBadge: {
// Style object property
    paddingHorizontal: 8,
// Style object property
    paddingVertical: 4,
// Style object property
    borderRadius: 6,
  },
// Style object property
  editorBadge: { backgroundColor: "#C8E6C9" },
// Style object property
  editorBadgeText: { fontSize: 10, fontWeight: "bold", color: "#2E7D32" },
// Style object property
  viewerBadge: { backgroundColor: "#BBDEFB" },
// Style object property
  viewerBadgeText: { fontSize: 10, fontWeight: "bold", color: "#1565C0" },
// Style object property
  youBadge: {
// Style object property
    backgroundColor: "#E8F4FD",
// Style object property
    paddingHorizontal: 8,
// Style object property
    paddingVertical: 4,
// Style object property
    borderRadius: 6,
  },
// Style object property
  youText: { fontSize: 10, fontWeight: "bold", color: "#3498DB" },
// Style object property
  emptyText: {
// Style object property
    fontSize: 13,
// Style object property
    color: "#95A5A6",
// Style object property
    textAlign: "center",
// Style object property
    paddingVertical: 10,
  },
// Style object property
  settingsItem: {
// Style object property
    flexDirection: "row",
// Style object property
    alignItems: "center",
// Style object property
    backgroundColor: "#FFF",
// Style object property
    padding: 15,
// Style object property
    borderRadius: 12,
// Style object property
    gap: 12,
  },
// Style object property
  settingsItemIcon: { fontSize: 18 },
// Style object property
  settingsItemTitle: { fontSize: 14, fontWeight: "bold" },
});
