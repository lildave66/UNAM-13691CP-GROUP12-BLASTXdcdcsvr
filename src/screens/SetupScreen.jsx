/*
 * File: src\screens\SetupScreen.jsx
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
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// Import project dependencies
import React, { useState, useEffect } from "react";
// Import project dependencies
import { useNavigation } from "@react-navigation/native";
// Import project dependencies
import { storage, RBAC } from "../utils/storage";
// Import project dependencies
import { db } from "../utils/firebase";
// Import project dependencies
import { doc, getDoc } from "firebase/firestore";
// Import project dependencies
import { Input, Button } from "../components";

// Define a function or component using an arrow function
const SetupScreen = () => {
  // Declare a constant or variable
  const navigation = useNavigation();
  // Declare a constant or variable
  const [currentStep, setCurrentStep] = useState(1);
  // Declare a constant or variable
  const [setupData, setSetupData] = useState({
    // Style object property
    companyName: "",
    // Style object property
    mineType: "",
    // Style object property
    location: "",
    // Style object property
    mineDepth: "",
    // Style object property
    rbacEnabled: true,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const data = await storage.getUserData(true);
    const isAdmin = RBAC.isCompanyAdmin(data?.uid, data?.company);

    if (isAdmin) {
      return;
    }

    if (!data?.companyCode) {
      Alert.alert(
        "Access Denied",
        "Only the person who registered this mine can access the setup page.",
      );
      navigation.replace("Dashboard");
      return;
    }

    try {
      const companySnap = await getDoc(doc(db, "companies", data.companyCode));
      const companyData = companySnap.exists() ? companySnap.data() : null;

      if (companyData?.registeredBy !== data.uid) {
        Alert.alert(
          "Access Denied",
          "Only the person who registered this mine can access the setup page.",
        );
        navigation.replace("Dashboard");
      }
    } catch (error) {
      console.error("Error verifying company ownership:", error);
      Alert.alert(
        "Access Denied",
        "Only the person who registered this mine can access the setup page.",
      );
      navigation.replace("Dashboard");
    }
  };

  // Define a function or component using an arrow function
  const handleNext = () => {
    // Control flow statement
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Define a function or component using an arrow function
  const handleFinish = async () => {
    // Control flow statement
    if (!setupData.companyName.trim() || !setupData.mineType.trim()) {
      Alert.alert("Error", "Please fill in company name and mine type");
      return;
    }

    // Control flow statement
    try {
      // Declare a constant or variable
      const uData = await storage.getUserData();
      // Control flow statement
      if (uData && uData.companyCode) {
        // Wait for an asynchronous operation
        await storage.updateCompanyInfo(uData.companyCode, {
          // Style object property
          name: setupData.companyName,
          // Style object property
          mineType: setupData.mineType,
          // Style object property
          location: setupData.location,
          // Style object property
          mineDepth: setupData.mineDepth,
          // Style object property
          rbacEnabled: setupData.rbacEnabled,
        });
        navigation.reset({
          // Style object property
          index: 0,
          // Style object property
          routes: [{ name: "Dashboard" }],
        });
      } else {
        Alert.alert("Error", "User data not found. Please log in again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  // Define a function or component using an arrow function
  const handleBack = () => {
    // Control flow statement
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Define a function or component using an arrow function
  const handleInputChange = (field, value) => {
    setSetupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Define a function or component using an arrow function
  const renderStepContent = () => {
    // Control flow statement
    switch (currentStep) {
      // Control flow statement
      case 1:
        // Return JSX layout
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Welcome to Mine Blast Ops!</Text>
            <Text style={styles.stepDescription}>
              Let's set up your mining company for safe and efficient blast
              operations. We'll configure your team's permissions and mine
              details in just a few steps.
            </Text>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeIcon}>⛏️</Text>
              <Text style={styles.welcomeText}>
                Coordinate blast operations with role-based access control for
                your team
              </Text>
            </View>
          </View>
        );
      // Control flow statement
      case 2:
        // Return JSX layout
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Mining Operation Details</Text>
            <Text style={styles.stepDescription}>
              Tell us about your mining operation so we can personalize your
              experience.
            </Text>
            <Input
              label="Company Name *"
              placeholder="e.g., North Pit Mining Inc."
              value={setupData.companyName}
              onChangeText={(value) => handleInputChange("companyName", value)}
            />
            <Input
              label="Mine Type *"
              placeholder="e.g., Underground Coal Mine"
              value={setupData.mineType}
              onChangeText={(value) => handleInputChange("mineType", value)}
            />
            <Input
              label="Location/Region"
              placeholder="e.g., Northern State/Region"
              value={setupData.location}
              onChangeText={(value) => handleInputChange("location", value)}
            />
            <Input
              label="Average Depth/Level"
              placeholder="e.g., 250m or Surface"
              value={setupData.mineDepth}
              onChangeText={(value) => handleInputChange("mineDepth", value)}
            />
          </View>
        );
      // Control flow statement
      case 3:
        // Return JSX layout
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Access Control Settings</Text>
            <Text style={styles.stepDescription}>
              Configure role-based access control for your team members.
            </Text>
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>
                    Role-Based Access Control
                  </Text>
                  <Text style={styles.settingDescription}>
                    {setupData.rbacEnabled
                      ? "Only Engineers, Specialists, and Analysts can edit records. Others view-only."
                      : "All team members can view and edit records."}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.toggleButton,
                    setupData.rbacEnabled && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    handleInputChange("rbacEnabled", !setupData.rbacEnabled)
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      setupData.rbacEnabled && styles.toggleTextActive,
                    ]}
                  >
                    {setupData.rbacEnabled ? "ON" : "OFF"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  {setupData.rbacEnabled
                    ? "This setting will enforce role-based permissions for all team members. The company admin (you) can modify this anytime in the settings."
                    : "All team members will have the same level of access. You can change this anytime."}
                </Text>
              </View>
            </View>

            <View style={styles.setupComplete}>
              <Text style={styles.completeIcon}>✅</Text>
              <Text style={styles.completeTitle}>Ready to Go!</Text>
              <Text style={styles.completeText}>
                Your mine blast scheduling system is configured and ready. Your
                team can now start planning and recording blast operations.
              </Text>
            </View>
          </View>
        );
      // Control flow statement
      default:
        // Return a value from the function
        return null;
    }
  };

  // Return JSX layout
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mine Setup</Text>
        <Pressable
          style={styles.skipButton}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step && styles.activeProgressDot,
              ]}
            >
              <Text
                style={[
                  styles.progressNumber,
                  currentStep >= step && styles.activeProgressNumber,
                ]}
              >
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.activeProgressLine,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <Button
            label="Back"
            variant="secondary"
            onPress={handleBack}
            style={styles.backButton}
          />
        )}
        <Button
          label={currentStep === 3 ? "Start Operating" : "Next"}
          onPress={currentStep === 3 ? handleFinish : handleNext}
          style={[styles.nextButton, currentStep === 3 && styles.finishButton]}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

// Export the default component or module
export default SetupScreen;
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
  headerTitle: {
    // Style object property
    fontSize: 28,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#FFF",
  },
  // Style object property
  skipButton: {
    // Style object property
    backgroundColor: "rgba(255,255,255,0.2)",
    // Style object property
    paddingHorizontal: 12,
    // Style object property
    paddingVertical: 6,
    // Style object property
    borderRadius: 15,
  },
  // Style object property
  skipButtonText: {
    // Style object property
    color: "#FFF",
    // Style object property
    fontSize: 14,
  },
  // Style object property
  progressContainer: {
    // Style object property
    flexDirection: "row",
    // Style object property
    justifyContent: "center",
    // Style object property
    alignItems: "center",
    // Style object property
    paddingVertical: 20,
    // Style object property
    paddingHorizontal: 20,
  },
  // Style object property
  progressItem: {
    // Style object property
    flexDirection: "row",
    // Style object property
    alignItems: "center",
  },
  // Style object property
  progressDot: {
    // Style object property
    width: 40,
    // Style object property
    height: 40,
    // Style object property
    borderRadius: 20,
    // Style object property
    backgroundColor: "#E0E0E0",
    // Style object property
    justifyContent: "center",
    // Style object property
    alignItems: "center",
  },
  // Style object property
  activeProgressDot: {
    // Style object property
    backgroundColor: "#FF9900",
  },
  // Style object property
  progressNumber: {
    // Style object property
    fontSize: 16,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#95A5A6",
  },
  // Style object property
  activeProgressNumber: {
    // Style object property
    color: "#FFF",
  },
  // Style object property
  progressLine: {
    // Style object property
    width: 30,
    // Style object property
    height: 2,
    // Style object property
    backgroundColor: "#E0E0E0",
    // Style object property
    marginHorizontal: 5,
  },
  // Style object property
  activeProgressLine: {
    // Style object property
    backgroundColor: "#FF9900",
  },
  // Style object property
  content: {
    // Style object property
    flex: 1,
    // Style object property
    padding: 20,
  },
  // Style object property
  stepContent: {
    // Style object property
    flex: 1,
  },
  // Style object property
  stepTitle: {
    // Style object property
    fontSize: 24,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#2C3E50",
    // Style object property
    marginBottom: 10,
  },
  // Style object property
  stepDescription: {
    // Style object property
    fontSize: 16,
    // Style object property
    color: "#95A5A6",
    // Style object property
    lineHeight: 22,
    // Style object property
    marginBottom: 30,
  },
  // Style object property
  welcomeCard: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 15,
    // Style object property
    padding: 20,
    // Style object property
    alignItems: "center",
    // Style object property
    shadowColor: "#000",
    // Style object property
    shadowOffset: { width: 0, height: 2 },
    // Style object property
    shadowOpacity: 0.1,
    // Style object property
    shadowRadius: 3,
    // Style object property
    elevation: 3,
  },
  // Style object property
  welcomeIcon: {
    // Style object property
    fontSize: 48,
    // Style object property
    marginBottom: 15,
  },
  // Style object property
  welcomeText: {
    // Style object property
    fontSize: 16,
    // Style object property
    color: "#2C3E50",
    // Style object property
    textAlign: "center",
    // Style object property
    lineHeight: 22,
  },
  // Style object property
  inputContainer: {
    // Style object property
    marginBottom: 20,
  },
  // Style object property
  inputLabel: {
    // Style object property
    fontSize: 14,
    // Style object property
    fontWeight: "600",
    // Style object property
    color: "#2C3E50",
    // Style object property
    marginBottom: 8,
  },
  // Style object property
  textInput: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 10,
    // Style object property
    padding: 15,
    // Style object property
    fontSize: 16,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
  },
  // Style object property
  pickerContainer: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 10,
    // Style object property
    overflow: "hidden",
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
  },
  // Style object property
  settingCard: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 15,
    // Style object property
    padding: 20,
    // Style object property
    marginBottom: 20,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
  },
  // Style object property
  settingHeader: {
    // Style object property
    flexDirection: "row",
    // Style object property
    justifyContent: "space-between",
    // Style object property
    alignItems: "center",
    // Style object property
    marginBottom: 15,
  },
  // Style object property
  settingTitle: {
    // Style object property
    fontSize: 16,
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
    marginTop: 4,
  },
  // Style object property
  toggleButton: {
    // Style object property
    backgroundColor: "#E0E0E0",
    // Style object property
    paddingHorizontal: 12,
    // Style object property
    paddingVertical: 6,
    // Style object property
    borderRadius: 15,
  },
  // Style object property
  toggleButtonActive: {
    // Style object property
    backgroundColor: "#FF9900",
  },
  // Style object property
  toggleText: {
    // Style object property
    fontSize: 12,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#95A5A6",
  },
  // Style object property
  toggleTextActive: {
    // Style object property
    color: "#FFF",
  },
  // Style object property
  infoCard: {
    // Style object property
    backgroundColor: "#FEF5E7",
    // Style object property
    borderRadius: 10,
    // Style object property
    padding: 15,
    // Style object property
    flexDirection: "row",
    // Style object property
    alignItems: "flex-start",
    // Style object property
    marginBottom: 20,
    // Style object property
    borderLeftWidth: 4,
    // Style object property
    borderLeftColor: "#FF9900",
  },
  // Style object property
  infoIcon: {
    // Style object property
    fontSize: 20,
    // Style object property
    marginRight: 10,
  },
  // Style object property
  infoText: {
    // Style object property
    fontSize: 14,
    // Style object property
    color: "#2C3E50",
    // Style object property
    lineHeight: 20,
    // Style object property
    flex: 1,
  },
  // Style object property
  setupComplete: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 15,
    // Style object property
    padding: 20,
    // Style object property
    alignItems: "center",
    // Style object property
    shadowColor: "#000",
    // Style object property
    shadowOffset: { width: 0, height: 2 },
    // Style object property
    shadowOpacity: 0.1,
    // Style object property
    shadowRadius: 3,
    // Style object property
    elevation: 3,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#2ECC71",
  },
  // Style object property
  completeIcon: {
    // Style object property
    fontSize: 48,
    // Style object property
    marginBottom: 15,
  },
  // Style object property
  completeTitle: {
    // Style object property
    fontSize: 20,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#2C3E50",
    // Style object property
    marginBottom: 10,
  },
  // Style object property
  completeText: {
    // Style object property
    fontSize: 16,
    // Style object property
    color: "#95A5A6",
    // Style object property
    textAlign: "center",
    // Style object property
    lineHeight: 22,
  },
  // Style object property
  navigationContainer: {
    // Style object property
    flexDirection: "row",
    // Style object property
    padding: 20,
    // Style object property
    gap: 15,
  },
  // Style object property
  backButton: {
    // Style object property
    flex: 1,
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 10,
    // Style object property
    paddingVertical: 15,
    // Style object property
    alignItems: "center",
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
  },
  // Style object property
  backButtonText: {
    // Style object property
    fontSize: 16,
    // Style object property
    fontWeight: "600",
    // Style object property
    color: "#2C3E50",
  },
  // Style object property
  nextButton: {
    // Style object property
    flex: 2,
    // Style object property
    backgroundColor: "#FF9900",
    // Style object property
    borderRadius: 10,
    // Style object property
    paddingVertical: 15,
    // Style object property
    alignItems: "center",
  },
  // Style object property
  finishButton: {
    // Style object property
    backgroundColor: "#2ECC71",
  },
  // Style object property
  nextButtonText: {
    // Style object property
    fontSize: 16,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#FFF",
  },
  // Style object property
  finishButtonText: {
    // Style object property
    color: "#FFF",
  },
});
