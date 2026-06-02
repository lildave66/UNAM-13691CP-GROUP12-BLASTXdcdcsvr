
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

import { ExportUtils } from "../utils/export";

import { Input, Button } from "../components";


const RecordBlastResultsScreen = () => {

  const navigation = useNavigation();

  const route = useRoute();

  const { blast } = route.params || {};


  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [userData, setUserData] = useState(null);

  const [canEdit, setCanEdit] = useState(true);

  const [isAdminUser, setIsAdminUser] = useState(false);

  const [results, setResults] = useState({

    rocksFragmented: blast?.results?.rocksFragmented || "",
// Style object property
    productivityRating: blast?.results?.productivityRating || "",
// Style object property
    safetyIncidents: blast?.results?.safetyIncidents?.toString() || "0",

    notes: blast?.results?.notes || "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Create a single-item array for the report generator
      const singleBlastReport = [{
        ...blast,
        results: {
          ...results,
          recordedAt: new Date().toISOString()
        }
      }];
      
      await ExportUtils.generateBlastReport(
        singleBlastReport,
        userData?.company,
        `Operation: ${blast.title}`
      );
    } catch (error) {
      console.error("Export failed", error);
      Alert.alert("Export Failed", "Could not generate PDF report.");
    } finally {
      setExporting(false);
    }
  };


  const loadUserData = async () => {

    try {

      const user = await storage.getUserData();
      setUserData(user);

      
      const isAdmin = RBAC.isCompanyAdmin(user?.uid, user?.company);
      setIsAdminUser(isAdmin);
      const rbacEnabled = user?.company?.rbacEnabled !== false;

      
      const canEditRecords = isAdmin || !rbacEnabled || RBAC.canEditBlasts(user?.minePosition);
      setCanEdit(canEditRecords);


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


  const handleSave = async () => {
    if (!results.rocksFragmented.trim() || !results.productivityRating.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const success = await storage.recordBlastResults(
        blast.companyCode || userData?.companyCode,
        blast.id,
        {
          ...results,
          productivityRating: parseFloat(results.productivityRating),
          safetyIncidents: parseInt(results.safetyIncidents) || 0,
        }
      );

      if (success) {
        Alert.alert("Success", "Blast results recorded successfully.", [
          { text: "OK", onPress: () => navigation.navigate("Dashboard") },
        ]);
      } else {
        Alert.alert("Error", "Failed to record results. Please try again.");
      }
    } catch (error) {
      console.error("Save error", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Record Blast Results</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={handleExport} disabled={exporting}>
              {exporting ? (
                <ActivityIndicator size="small" color="#FF9900" />
              ) : (
                <Text style={styles.exportText}>📥 PDF</Text>
              )}
            </Pressable>
            {isAdminUser && (
              <Pressable onPress={handleDelete}>
                <Text style={styles.deleteHeaderButton}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>

        {}
        {!canEdit && (
          <View style={styles.readOnlyBanner}>
            <Text style={styles.readOnlyText}> READ-ONLY MODE</Text>
            <Text style={styles.readOnlySubtext}>
              Your position ({userData?.minePosition}) cannot edit records
            </Text>
          </View>
        )}

        {}
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

        {}
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

        {}
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


export default RecordBlastResultsScreen;


const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F8F9FA",
  },

  scrollContent: {

    paddingBottom: 40,
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
  exportText: {
    color: "#FF9900",
    fontSize: 14,
    fontWeight: "bold",
  },

  deleteHeaderButton: {
    color: "#E74C3C",
    fontSize: 14,
    fontWeight: "bold",
  },

  readOnlyBanner: {

    backgroundColor: "#FFF3CD",

    paddingHorizontal: 20,

    paddingVertical: 12,

    marginTop: 10,

    marginHorizontal: 15,

    borderRadius: 8,

    borderLeftWidth: 4,

    borderLeftColor: "#FF9900",
  },

  readOnlyText: {

    fontSize: 14,

    fontWeight: "bold",

    color: "#856404",
  },

  readOnlySubtext: {

    fontSize: 12,

    color: "#856404",

    marginTop: 4,
  },

  blastInfo: {

    backgroundColor: "#FFF",

    paddingHorizontal: 20,

    paddingVertical: 15,

    marginTop: 10,

    borderBottomWidth: 1,

    borderBottomColor: "#ECEFF1",
  },

  blastInfoTitle: {

    fontSize: 16,

    fontWeight: "bold",

    color: "#1A1F3A",

    marginBottom: 5,
  },

  blastInfoDescription: {

    fontSize: 13,

    color: "#666",

    marginBottom: 8,
  },

  blastInfoDate: {

    fontSize: 12,

    color: "#95A5A6",

    marginTop: 3,
  },

  form: {

    paddingHorizontal: 20,

    paddingVertical: 20,
  },

  sectionTitle: {

    fontSize: 15,

    fontWeight: "bold",

    color: "#1A1F3A",

    marginTop: 20,

    marginBottom: 15,
  },

  formGroup: {

    marginBottom: 18,
  },

  label: {

    fontSize: 13,

    fontWeight: "600",

    color: "#1A1F3A",

    marginBottom: 6,
  },

  input: {

    backgroundColor: "#FFF",

    borderWidth: 1,

    borderColor: "#E0E0E0",

    borderRadius: 8,

    paddingHorizontal: 12,

    paddingVertical: 10,

    fontSize: 14,

    color: "#1A1F3A",
  },

  disabledInput: {

    backgroundColor: "#F5F5F5",

    color: "#95A5A6",
  },

  textArea: {

    paddingVertical: 12,

    minHeight: 80,
  },

  hint: {

    fontSize: 11,

    color: "#95A5A6",

    marginTop: 4,

    fontStyle: "italic",
  },

  metric: {

    fontSize: 12,

    color: "#FF9900",

    fontWeight: "600",

    marginTop: 6,
  },

  saveButton: {

    backgroundColor: "#FF9900",

    marginHorizontal: 20,

    marginBottom: 10,

    borderRadius: 10,

    paddingVertical: 14,

    alignItems: "center",

    elevation: 3,

    shadowColor: "#FF9900",

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.3,

    shadowRadius: 5,
  },

  saveButtonText: {

    color: "#FFF",

    fontSize: 16,

    fontWeight: "bold",
  },

  cancelButton: {

    backgroundColor: "#FFF",

    marginHorizontal: 20,

    marginBottom: 20,

    borderRadius: 10,

    paddingVertical: 14,

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#E0E0E0",
  },

  cancelButtonText: {

    color: "#666",

    fontSize: 16,

    fontWeight: "600",
  },

  viewOnlyNotice: {

    backgroundColor: "#E8F4F8",

    marginHorizontal: 20,

    marginBottom: 20,

    paddingHorizontal: 15,

    paddingVertical: 12,

    borderRadius: 8,

    borderLeftWidth: 4,

    borderLeftColor: "#17A2B8",
  },

  viewOnlyText: {

    fontSize: 13,

    color: "#0C5460",

    fontWeight: "500",
  },
});
