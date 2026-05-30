/*
 * File: src\screens\AdminSettingsScreen.jsx
 * Description: Screen for company admins to manage team members.
 */

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { storage, RBAC, MINE_ROLES } from "../utils/storage";

const AdminSettingsScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await storage.getUserData();
    setUserData(data);

    if (data) {
      const team = await storage.getTeammates(data.companyCode);
      // Sort: Admin first, then by name
      const sortedTeam = team.sort((a, b) => {
        if (a.uid === data.company?.registeredBy) return -1;
        if (b.uid === data.company?.registeredBy) return 1;
        return a.name.localeCompare(b.name);
      });
      setTeammates(sortedTeam);
    }
    setLoading(false);
  };

  const handleRemoveMember = (member) => {
    if (member.uid === userData.uid) {
      Alert.alert("Action Not Allowed", "You cannot remove yourself.");
      return;
    }

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${member.name} from the team? They will lose access to all company data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            const success = await storage.removeTeammate(
              userData.companyCode,
              member.uid
            );
            if (success) {
              setTeammates((prev) => prev.filter((m) => m.uid !== member.uid));
              Alert.alert("Success", `${member.name} has been removed.`);
            } else {
              Alert.alert("Error", "Failed to remove member.");
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleUpdateRole = async (newRole) => {
    if (!selectedMember) return;
    
    setShowRoleModal(false);
    setActionLoading(true);
    
    const success = await storage.updateTeammatePosition(
      userData.companyCode,
      selectedMember.uid,
      newRole
    );

    if (success) {
      setTeammates((prev) =>
        prev.map((m) =>
          m.uid === selectedMember.uid ? { ...m, minePosition: newRole } : m
        )
      );
      Alert.alert("Success", `Role updated for ${selectedMember.name}`);
    } else {
      Alert.alert("Error", "Failed to update role.");
    }
    
    setActionLoading(false);
    setSelectedMember(null);
  };

  const renderMember = ({ item }) => {
    const isAdmin = item.uid === userData?.company?.registeredBy;
    const isMe = item.uid === userData?.uid;

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.memberName}>{item.name}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
              {isMe && (
                <View style={styles.meBadge}>
                  <Text style={styles.meBadgeText}>YOU</Text>
                </View>
              )}
            </View>
            <Text style={styles.memberEmail}>{item.email}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Position: </Text>
              <Text style={styles.roleValue}>{item.minePosition}</Text>
            </View>
          </View>
        </View>

        {!isAdmin && (
          <View style={styles.actionRow}>
            <Pressable
              style={styles.changeRoleButton}
              onPress={() => {
                setSelectedMember(item);
                setShowRoleModal(true);
              }}
            >
              <Text style={styles.changeRoleText}>Change Role</Text>
            </Pressable>
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveMember(item)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Team Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Manage members of {userData?.company?.name}
        </Text>
        
        <FlatList
          data={teammates}
          keyExtractor={(item) => item.uid}
          renderItem={renderMember}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No team members found.</Text>
          }
        />
      </View>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Role</Text>
            <Text style={styles.modalSubtitle}>
              Select a new position for {selectedMember?.name}
            </Text>
            
            <ScrollView style={styles.roleList}>
              {Object.values(MINE_ROLES).map((role) => (
                <Pressable
                  key={role}
                  style={[
                    styles.roleItem,
                    selectedMember?.minePosition === role && styles.selectedRoleItem,
                  ]}
                  onPress={() => handleUpdateRole(role)}
                >
                  <View>
                    <Text style={[
                      styles.roleItemText,
                      selectedMember?.minePosition === role && styles.selectedRoleItemText
                    ]}>
                      {role}
                    </Text>
                    <Text style={styles.rolePermission}>
                      {["Engineer", "Specialist", "Analyst"].includes(role) 
                        ? "Can edit & record blasts" 
                        : "Read-only access"}
                    </Text>
                  </View>
                  {selectedMember?.minePosition === role && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
            
            <Pressable
              style={styles.closeModalButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {actionLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FF9900" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: "#1A1F3A",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: { color: "#FFF", fontSize: 13, fontWeight: "500" },
  content: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 20,
    fontWeight: "500",
  },
  memberCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  memberInfo: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF9900",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  memberName: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  memberEmail: { fontSize: 12, color: "#95A5A6", marginTop: 2 },
  adminBadge: {
    backgroundColor: "#FFEAA7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: { fontSize: 9, fontWeight: "bold", color: "#D68910" },
  meBadge: {
    backgroundColor: "#D6EAF8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  meBadgeText: { fontSize: 9, fontWeight: "bold", color: "#2E86C1" },
  roleContainer: { flexDirection: "row", marginTop: 6, alignItems: "center" },
  roleLabel: { fontSize: 12, color: "#95A5A6" },
  roleValue: { fontSize: 12, fontWeight: "600", color: "#FF9900" },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F2F4F4",
    paddingTop: 12,
    gap: 10,
  },
  changeRoleButton: {
    flex: 1,
    backgroundColor: "#F8F9F9",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5DBDB",
  },
  changeRoleText: { color: "#5D6D7E", fontSize: 12, fontWeight: "600" },
  removeButton: {
    flex: 1,
    backgroundColor: "#FDEDEC",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FADBD8",
  },
  removeText: { color: "#E74C3C", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#95A5A6", marginTop: 40 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1A1F3A", marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: "#7F8C8D", marginBottom: 20 },
  roleList: { marginBottom: 20 },
  roleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  selectedRoleItem: { backgroundColor: "#FFF4E5", borderColor: "#FF9900", borderWidth: 1 },
  roleItemText: { fontSize: 15, fontWeight: "600", color: "#2C3E50" },
  selectedRoleItemText: { color: "#E67E22" },
  rolePermission: { fontSize: 11, color: "#95A5A6", marginTop: 2 },
  checkIcon: { fontSize: 18, color: "#FF9900", fontWeight: "bold" },
  closeModalButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  closeModalText: { color: "#95A5A6", fontSize: 15, fontWeight: "600" },
});

export default AdminSettingsScreen;
