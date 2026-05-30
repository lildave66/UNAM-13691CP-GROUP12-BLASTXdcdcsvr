
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { storage, RBAC } from "../utils/storage";
import { Input, Button } from "../components";

// Define a function or component using an arrow function
const RecordBlastResultsScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();
// Declare a constant or variable
  const route = useRoute();
// Declare a constant or variable
  const { blast } = route.params || {};

// Declare a constant or variable
  const [loading, setLoading] = useState(false);
// Declare a constant or variable
  const [userData, setUserData] = useState(null);
// Declare a constant or variable
  const [canEdit, setCanEdit] = useState(true);
// Declare a constant or variable
  const [isAdminUser, setIsAdminUser] = useState(false);
// Declare a constant or variable
  const [results, setResults] = useState({
// Style object property
    rocksFragmented: blast?.rocksFragmented || "",
// Style object property
    productivityRating: blast?.productivityRating || "",
// Style object property
    safetyIncidents: blast?.safetyIncidents?.toString() || "0",
// Style object property
    notes: blast?.results?.notes || "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

// Define a function or component using an arrow function
  const loadUserData = async () => {
// Control flow statement
    try {
// Declare a constant or variable
      const user = await storage.getUserData();
      setUserData(user);

      // Check if user is admin
      const isAdmin = RBAC.isCompanyAdmin(user?.uid, user?.company);
      setIsAdminUser(isAdmin);
      const rbacEnabled = user?.company?.rbacEnabled !== false;

      // Check if user can edit: Admin can always edit, otherwise check role if RBAC is enabled
      const canEditRecords = isAdmin || !rbacEnabled || RBAC.canEditBlasts(user?.minePosition);
      setCanEdit(canEditRecords);

// Control flow statement
      if (!canEditRecords) {
        Alert.alert(
          "Read-Only Mode",
          `Your position (${user?.minePosition}) does not have permission to edit records.`,
        );
      }
    } catch (error) {
      console.error("Error loading user data", error);
    }
  };

// Define a function or component using an arrow function
  const handleSave = async () => {
// ... (existing handleSave)
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this blast record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const success = await storage.deleteBlast(
              blast.companyCode || userData?.companyCode,
              blast.id
            );
            setLoading(false);
            if (success) {
              Alert.alert("Success", "Blast record deleted.", [
                { text: "OK", onPress: () => navigation.navigate("Dashboard") },
              ]);
            } else {
              Alert.alert("Error", "Failed to delete record.");
            }
          },
        },
      ]
    );
  };

// Return JSX layout

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Record Blast Results</Text>
          {isAdminUser ? (
            <Pressable onPress={handleDelete}>
              <Text style={styles.deleteHeaderButton}>Delete</Text>
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Permission Status */}
        {!canEdit && (
          <View style={styles.readOnlyBanner}>
            <Text style={styles.readOnlyText}> READ-ONLY MODE</Text>
            <Text style={styles.readOnlySubtext}>
              Your position ({userData?.minePosition}) cannot edit records
            </Text>
          </View>
        )}

        {/* Blast Info */}
        {blast && (
          <View style={styles.blastInfo}>
            <Text style={styles.blastInfoTitle}>{blast.title}</Text>
            <Text style={styles.blastInfoDescription}>{blast.description}</Text>
            <Text style={styles.blastInfoDate}>Target: {blast.targetArea}</Text>
            <Text style={styles.blastInfoDate}>
              Scheduled: {blast.launchDate}
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>⚡ Blast Results</Text>

          <Input
            label="Rocks Fragmented (tons) *"
            placeholder="e.g., 2500 tons"
            value={results.rocksFragmented}
            onChangeText={(value) =>
              canEdit && setResults({ ...results, rocksFragmented: value })
            }
            editable={canEdit}
          />

          <Input
            label="Productivity Rating (%) *"
            placeholder="e.g., 95%"
            keyboardType="decimal-pad"
            value={results.productivityRating}
            onChangeText={(value) =>
              canEdit && setResults({ ...results, productivityRating: value })
            }
            editable={canEdit}
          />
          <Text style={styles.hint}>
            Rating based on fragmentation quality
          </Text>

          <Input
            label="Safety Incidents"
            placeholder="Number of incidents"
            keyboardType="number-pad"
            value={results.safetyIncidents}
            onChangeText={(value) =>
              canEdit && setResults({ ...results, safetyIncidents: value })
            }
            editable={canEdit}
          />

          <Input
            label="Observations & Notes"
            placeholder="Add any observations about this blast operation..."
            multiline
            numberOfLines={4}
            value={results.notes}
            onChangeText={(value) =>
              canEdit && setResults({ ...results, notes: value })
            }
            editable={canEdit}
          />
        </View>

        {/* Save Button - Only show if user can edit */}
        {canEdit && (
          <View style={{ paddingHorizontal: 20 }}>
            <Button
              label="Save Blast Report"
              onPress={handleSave}
              disabled={loading}
              style={styles.saveButton}
            />

            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
            />
          </View>
        )}

        {!canEdit && (
          <View style={styles.viewOnlyNotice}>
            <Text style={styles.viewOnlyText}>
              Contact an Engineer, Specialist, or Analyst to edit this record
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Export the default component or module
export default RecordBlastResultsScreen;

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
  scrollContent: {
// Style object property
    paddingBottom: 40,
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
// Style object property
  deleteHeaderButton: {
    color: "#E74C3C",
    fontSize: 14,
    fontWeight: "bold",
  },
// Style object property
  readOnlyBanner: {
// Style object property
    backgroundColor: "#FFF3CD",
// Style object property
    paddingHorizontal: 20,
// Style object property
    paddingVertical: 12,
// Style object property
    marginTop: 10,
// Style object property
    marginHorizontal: 15,
// Style object property
    borderRadius: 8,
// Style object property
    borderLeftWidth: 4,
// Style object property
    borderLeftColor: "#FF9900",
  },
// Style object property
  readOnlyText: {
// Style object property
    fontSize: 14,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#856404",
  },
// Style object property
  readOnlySubtext: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#856404",
// Style object property
    marginTop: 4,
  },
// Style object property
  blastInfo: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    paddingHorizontal: 20,
// Style object property
    paddingVertical: 15,
// Style object property
    marginTop: 10,
// Style object property
    borderBottomWidth: 1,
// Style object property
    borderBottomColor: "#ECEFF1",
  },
// Style object property
  blastInfoTitle: {
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
// Style object property
    marginBottom: 5,
  },
// Style object property
  blastInfoDescription: {
// Style object property
    fontSize: 13,
// Style object property
    color: "#666",
// Style object property
    marginBottom: 8,
  },
// Style object property
  blastInfoDate: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#95A5A6",
// Style object property
    marginTop: 3,
  },
// Style object property
  form: {
// Style object property
    paddingHorizontal: 20,
// Style object property
    paddingVertical: 20,
  },
// Style object property
  sectionTitle: {
// Style object property
    fontSize: 15,
// Style object property
    fontWeight: "bold",
// Style object property
    color: "#1A1F3A",
// Style object property
    marginTop: 20,
// Style object property
    marginBottom: 15,
  },
// Style object property
  formGroup: {
// Style object property
    marginBottom: 18,
  },
// Style object property
  label: {
// Style object property
    fontSize: 13,
// Style object property
    fontWeight: "600",
// Style object property
    color: "#1A1F3A",
// Style object property
    marginBottom: 6,
  },
// Style object property
  input: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderWidth: 1,
// Style object property
    borderColor: "#E0E0E0",
// Style object property
    borderRadius: 8,
// Style object property
    paddingHorizontal: 12,
// Style object property
    paddingVertical: 10,
// Style object property
    fontSize: 14,
// Style object property
    color: "#1A1F3A",
  },
// Style object property
  disabledInput: {
// Style object property
    backgroundColor: "#F5F5F5",
// Style object property
    color: "#95A5A6",
  },
// Style object property
  textArea: {
// Style object property
    paddingVertical: 12,
// Style object property
    minHeight: 80,
  },
// Style object property
  hint: {
// Style object property
    fontSize: 11,
// Style object property
    color: "#95A5A6",
// Style object property
    marginTop: 4,
// Style object property
    fontStyle: "italic",
  },
// Style object property
  metric: {
// Style object property
    fontSize: 12,
// Style object property
    color: "#FF9900",
// Style object property
    fontWeight: "600",
// Style object property
    marginTop: 6,
  },
// Style object property
  saveButton: {
// Style object property
    backgroundColor: "#FF9900",
// Style object property
    marginHorizontal: 20,
// Style object property
    marginBottom: 10,
// Style object property
    borderRadius: 10,
// Style object property
    paddingVertical: 14,
// Style object property
    alignItems: "center",
// Style object property
    elevation: 3,
// Style object property
    shadowColor: "#FF9900",
// Style object property
    shadowOffset: { width: 0, height: 2 },
// Style object property
    shadowOpacity: 0.3,
// Style object property
    shadowRadius: 5,
  },
// Style object property
  saveButtonText: {
// Style object property
    color: "#FFF",
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "bold",
  },
// Style object property
  cancelButton: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    marginHorizontal: 20,
// Style object property
    marginBottom: 20,
// Style object property
    borderRadius: 10,
// Style object property
    paddingVertical: 14,
// Style object property
    alignItems: "center",
// Style object property
    borderWidth: 1,
// Style object property
    borderColor: "#E0E0E0",
  },
// Style object property
  cancelButtonText: {
// Style object property
    color: "#666",
// Style object property
    fontSize: 16,
// Style object property
    fontWeight: "600",
  },
// Style object property
  viewOnlyNotice: {
// Style object property
    backgroundColor: "#E8F4F8",
// Style object property
    marginHorizontal: 20,
// Style object property
    marginBottom: 20,
// Style object property
    paddingHorizontal: 15,
// Style object property
    paddingVertical: 12,
// Style object property
    borderRadius: 8,
// Style object property
    borderLeftWidth: 4,
// Style object property
    borderLeftColor: "#17A2B8",
  },
// Style object property
  viewOnlyText: {
// Style object property
    fontSize: 13,
// Style object property
    color: "#0C5460",
// Style object property
    fontWeight: "500",
  },
});
