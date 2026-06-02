






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

import React, { useEffect, useState } from "react";

import { useNavigation } from "@react-navigation/native";

import { storage, RBAC } from "../utils/storage";

import { authHelpers } from "../utils/firebase";


const ProfileScreen = () => {

  const navigation = useNavigation();

  const [userData, setUserData] = useState(null);

  const [teammates, setTeammates] = useState([]);

  const [companySettings, setCompanySettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  const [rbacEnabled, setRbacEnabled] = useState(true);

  const [togglingRBAC, setTogglingRBAC] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);


  const loadProfileData = async () => {
    setLoading(true);

    const data = await storage.getUserData();
    setUserData(data);


    if (data) {
      const team = await storage.getTeammates(data.companyCode);
      setTeammates(team);


      const companyInfo = await storage.getCompany(data.companyCode);
      if (companyInfo) {
        setUserData(prev => ({ ...prev, company: companyInfo }));
      }


      const settings = await storage.getCompanySettings(data.companyCode);
      setCompanySettings(settings);

      

      const isAdmin = RBAC.isCompanyAdmin(data.uid, companyInfo || data.company);
      setIsCompanyAdmin(isAdmin);
      setRbacEnabled(companyInfo?.rbacEnabled ?? data.company?.rbacEnabled ?? true);
    }
    setLoading(false);
  };


  const handleToggleRBAC = async () => {

    if (!isCompanyAdmin) {
      Alert.alert(
        "Permission Denied",
        "Only the company administrator can change RBAC settings.",
      );
      return;
    }

    setTogglingRBAC(true);

    const newRBACState = !rbacEnabled;

    try {

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


  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? This will clear your local cache.",
      [
        { text: "Cancel", style: "cancel" },
        {

          text: "Logout",

          onPress: async () => {

            await storage.clearAll();
            await authHelpers.signOutUser();
          },

          style: "destructive",
        },
      ],
    );
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
      {}
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
        {}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.userName}>{userData?.name || "User"}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>

          {}
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}> {userData?.minePosition}</Text>
          </View>

          {}
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

        {}
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

        {}
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

        {}
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

        {}
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


export default ProfileScreen;


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

  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },

  backButton: {

    backgroundColor: "rgba(255,255,255,0.1)",

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 15,
  },

  backButtonText: { color: "#FFF", fontSize: 12 },

  content: { flex: 1, padding: 15 },

  profileCard: {

    backgroundColor: "#FFF",

    borderRadius: 20,

    padding: 25,

    alignItems: "center",

    marginBottom: 20,

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.05,

    elevation: 2,
  },

  avatarContainer: {

    width: 70,

    height: 70,

    borderRadius: 35,

    backgroundColor: "#F0F3F4",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 15,
  },

  avatar: { fontSize: 30 },

  userName: { fontSize: 20, fontWeight: "bold", color: "#2C3E50" },

  userEmail: { fontSize: 14, color: "#95A5A6", marginTop: 5 },

  positionBadge: {

    backgroundColor: "#FFE8CC",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,

    marginTop: 12,
  },

  positionText: {

    fontSize: 13,

    fontWeight: "bold",

    color: "#E67E22",
  },

  userStatsContainer: {

    flexDirection: "row",

    justifyContent: "space-around",

    width: "100%",

    borderTopWidth: 1,

    borderTopColor: "#ECF0F1",

    paddingTop: 20,

    marginTop: 20,
  },

  userStat: { alignItems: "center" },

  userStatValue: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },

  userStatLabel: { fontSize: 11, color: "#95A5A6", marginTop: 3 },

  companyCard: {

    backgroundColor: "#E8F7FF",

    borderRadius: 15,

    padding: 15,

    marginBottom: 20,

    borderLeftWidth: 4,

    borderLeftColor: "#3498DB",
  },

  companyHeader: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 10,
  },

  companySectionTitle: {

    fontSize: 14,

    fontWeight: "bold",

    color: "#2C3E50",
  },

  adminBadge: {

    backgroundColor: "#FFD700",

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,
  },

  adminBadgeText: {

    fontSize: 10,

    fontWeight: "bold",

    color: "#E67E22",
  },

  companyName: { fontSize: 16, fontWeight: "bold", color: "#0C5460" },

  companyDetail: { fontSize: 12, color: "#0C5460", marginTop: 5 },

  companyCodeHighlight: { fontWeight: "bold", color: "#FF9900" },

  section: { marginBottom: 25 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {

    fontSize: 16,

    fontWeight: "bold",

    color: "#2C3E50",

    marginBottom: 15,

    marginLeft: 5,
  },

  manageButton: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9900",
  },

  manageButtonText: {
    color: "#FF9900",
    fontSize: 12,
    fontWeight: "bold",
  },

  settingsCard: {

    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 15,
  },

  settingRow: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  settingLabel: {

    fontSize: 14,

    fontWeight: "bold",

    color: "#2C3E50",
  },

  settingDescription: {

    fontSize: 12,

    color: "#95A5A6",

    marginTop: 5,
  },

  teammateItem: {

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF",

    padding: 12,

    borderRadius: 12,

    marginBottom: 8,

    gap: 12,
  },

  teammateAvatar: {

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: "#1A1F3A",

    justifyContent: "center",

    alignItems: "center",
  },

  teammateInitial: { color: "#FFF", fontWeight: "bold" },

  teammateName: { fontSize: 14, fontWeight: "600", color: "#2C3E50" },

  teammateMinePosition: {

    fontSize: 12,

    color: "#FF9900",

    fontWeight: "600",
  },

  teammateEmail: { fontSize: 11, color: "#95A5A6" },

  teammateBadge: {

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,
  },

  editorBadge: { backgroundColor: "#C8E6C9" },

  editorBadgeText: { fontSize: 10, fontWeight: "bold", color: "#2E7D32" },

  viewerBadge: { backgroundColor: "#BBDEFB" },

  viewerBadgeText: { fontSize: 10, fontWeight: "bold", color: "#1565C0" },

  youBadge: {

    backgroundColor: "#E8F4FD",

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,
  },

  youText: { fontSize: 10, fontWeight: "bold", color: "#3498DB" },

  emptyText: {

    fontSize: 13,

    color: "#95A5A6",

    textAlign: "center",

    paddingVertical: 10,
  },

  settingsItem: {

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF",

    padding: 15,

    borderRadius: 12,

    gap: 12,
  },

  settingsItemIcon: { fontSize: 18 },

  settingsItemTitle: { fontSize: 14, fontWeight: "bold" },
});
