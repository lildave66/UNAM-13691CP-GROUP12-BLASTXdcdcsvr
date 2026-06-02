






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

import React, { useState, useEffect } from "react";

import { useNavigation } from "@react-navigation/native";

import { storage, RBAC } from "../utils/storage";

import { db } from "../utils/firebase";

import { doc, getDoc } from "firebase/firestore";

import { Input, Button } from "../components";


const SetupScreen = () => {
  
  const navigation = useNavigation();
  
  const [currentStep, setCurrentStep] = useState(1);
  
  const [setupData, setSetupData] = useState({
    
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

  
  const handleNext = () => {
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  
  const handleFinish = async () => {
    
    if (!setupData.companyName.trim() || !setupData.mineType.trim()) {
      Alert.alert("Error", "Please fill in company name and mine type");
      return;
    }

    
    try {
      
      const uData = await storage.getUserData();
      
      if (uData && uData.companyCode) {
        
        await storage.updateCompanyInfo(uData.companyCode, {
          
          name: setupData.companyName,
          
          mineType: setupData.mineType,
          
          location: setupData.location,
          
          mineDepth: setupData.mineDepth,
          
          rbacEnabled: setupData.rbacEnabled,
        });
        navigation.reset({
          
          index: 0,
          
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

  
  const handleBack = () => {
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  
  const handleInputChange = (field, value) => {
    setSetupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  
  const renderStepContent = () => {
    
    switch (currentStep) {
      
      case 1:
        
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
      
      case 2:
        
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
      
      case 3:
        
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
      
      default:
        
        return null;
    }
  };

  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mine Setup</Text>
        <Pressable
          style={styles.skipButton}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View>

      {}
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

      {}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {}
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


export default SetupScreen;

const styles = StyleSheet.create({
  
  container: {
    
    flex: 1,
    
    backgroundColor: "#F8F9FA",
  },
  
  header: {
    
    backgroundColor: "#1A1F3A",
    
    paddingTop: 50,
    
    paddingBottom: 20,
    
    paddingHorizontal: 20,
    
    flexDirection: "row",
    
    justifyContent: "space-between",
    
    alignItems: "center",
  },
  
  headerTitle: {
    
    fontSize: 28,
    
    fontWeight: "bold",
    
    color: "#FFF",
  },
  
  skipButton: {
    
    backgroundColor: "rgba(255,255,255,0.2)",
    
    paddingHorizontal: 12,
    
    paddingVertical: 6,
    
    borderRadius: 15,
  },
  
  skipButtonText: {
    
    color: "#FFF",
    
    fontSize: 14,
  },
  
  progressContainer: {
    
    flexDirection: "row",
    
    justifyContent: "center",
    
    alignItems: "center",
    
    paddingVertical: 20,
    
    paddingHorizontal: 20,
  },
  
  progressItem: {
    
    flexDirection: "row",
    
    alignItems: "center",
  },
  
  progressDot: {
    
    width: 40,
    
    height: 40,
    
    borderRadius: 20,
    
    backgroundColor: "#E0E0E0",
    
    justifyContent: "center",
    
    alignItems: "center",
  },
  
  activeProgressDot: {
    
    backgroundColor: "#FF9900",
  },
  
  progressNumber: {
    
    fontSize: 16,
    
    fontWeight: "bold",
    
    color: "#95A5A6",
  },
  
  activeProgressNumber: {
    
    color: "#FFF",
  },
  
  progressLine: {
    
    width: 30,
    
    height: 2,
    
    backgroundColor: "#E0E0E0",
    
    marginHorizontal: 5,
  },
  
  activeProgressLine: {
    
    backgroundColor: "#FF9900",
  },
  
  content: {
    
    flex: 1,
    
    padding: 20,
  },
  
  stepContent: {
    
    flex: 1,
  },
  
  stepTitle: {
    
    fontSize: 24,
    
    fontWeight: "bold",
    
    color: "#2C3E50",
    
    marginBottom: 10,
  },
  
  stepDescription: {
    
    fontSize: 16,
    
    color: "#95A5A6",
    
    lineHeight: 22,
    
    marginBottom: 30,
  },
  
  welcomeCard: {
    
    backgroundColor: "#FFF",
    
    borderRadius: 15,
    
    padding: 20,
    
    alignItems: "center",
    
    shadowColor: "#000",
    
    shadowOffset: { width: 0, height: 2 },
    
    shadowOpacity: 0.1,
    
    shadowRadius: 3,
    
    elevation: 3,
  },
  
  welcomeIcon: {
    
    fontSize: 48,
    
    marginBottom: 15,
  },
  
  welcomeText: {
    
    fontSize: 16,
    
    color: "#2C3E50",
    
    textAlign: "center",
    
    lineHeight: 22,
  },
  
  inputContainer: {
    
    marginBottom: 20,
  },
  
  inputLabel: {
    
    fontSize: 14,
    
    fontWeight: "600",
    
    color: "#2C3E50",
    
    marginBottom: 8,
  },
  
  textInput: {
    
    backgroundColor: "#FFF",
    
    borderRadius: 10,
    
    padding: 15,
    
    fontSize: 16,
    
    borderWidth: 1,
    
    borderColor: "#E0E0E0",
  },
  
  pickerContainer: {
    
    backgroundColor: "#FFF",
    
    borderRadius: 10,
    
    overflow: "hidden",
    
    borderWidth: 1,
    
    borderColor: "#E0E0E0",
  },
  
  settingCard: {
    
    backgroundColor: "#FFF",
    
    borderRadius: 15,
    
    padding: 20,
    
    marginBottom: 20,
    
    borderWidth: 1,
    
    borderColor: "#E0E0E0",
  },
  
  settingHeader: {
    
    flexDirection: "row",
    
    justifyContent: "space-between",
    
    alignItems: "center",
    
    marginBottom: 15,
  },
  
  settingTitle: {
    
    fontSize: 16,
    
    fontWeight: "bold",
    
    color: "#2C3E50",
  },
  
  settingDescription: {
    
    fontSize: 12,
    
    color: "#95A5A6",
    
    marginTop: 4,
  },
  
  toggleButton: {
    
    backgroundColor: "#E0E0E0",
    
    paddingHorizontal: 12,
    
    paddingVertical: 6,
    
    borderRadius: 15,
  },
  
  toggleButtonActive: {
    
    backgroundColor: "#FF9900",
  },
  
  toggleText: {
    
    fontSize: 12,
    
    fontWeight: "bold",
    
    color: "#95A5A6",
  },
  
  toggleTextActive: {
    
    color: "#FFF",
  },
  
  infoCard: {
    
    backgroundColor: "#FEF5E7",
    
    borderRadius: 10,
    
    padding: 15,
    
    flexDirection: "row",
    
    alignItems: "flex-start",
    
    marginBottom: 20,
    
    borderLeftWidth: 4,
    
    borderLeftColor: "#FF9900",
  },
  
  infoIcon: {
    
    fontSize: 20,
    
    marginRight: 10,
  },
  
  infoText: {
    
    fontSize: 14,
    
    color: "#2C3E50",
    
    lineHeight: 20,
    
    flex: 1,
  },
  
  setupComplete: {
    
    backgroundColor: "#FFF",
    
    borderRadius: 15,
    
    padding: 20,
    
    alignItems: "center",
    
    shadowColor: "#000",
    
    shadowOffset: { width: 0, height: 2 },
    
    shadowOpacity: 0.1,
    
    shadowRadius: 3,
    
    elevation: 3,
    
    borderWidth: 1,
    
    borderColor: "#2ECC71",
  },
  
  completeIcon: {
    
    fontSize: 48,
    
    marginBottom: 15,
  },
  
  completeTitle: {
    
    fontSize: 20,
    
    fontWeight: "bold",
    
    color: "#2C3E50",
    
    marginBottom: 10,
  },
  
  completeText: {
    
    fontSize: 16,
    
    color: "#95A5A6",
    
    textAlign: "center",
    
    lineHeight: 22,
  },
  
  navigationContainer: {
    
    flexDirection: "row",
    
    padding: 20,
    
    gap: 15,
  },
  
  backButton: {
    
    flex: 1,
    
    backgroundColor: "#FFF",
    
    borderRadius: 10,
    
    paddingVertical: 15,
    
    alignItems: "center",
    
    borderWidth: 1,
    
    borderColor: "#E0E0E0",
  },
  
  backButtonText: {
    
    fontSize: 16,
    
    fontWeight: "600",
    
    color: "#2C3E50",
  },
  
  nextButton: {
    
    flex: 2,
    
    backgroundColor: "#FF9900",
    
    borderRadius: 10,
    
    paddingVertical: 15,
    
    alignItems: "center",
  },
  
  finishButton: {
    
    backgroundColor: "#2ECC71",
  },
  
  nextButtonText: {
    
    fontSize: 16,
    
    fontWeight: "bold",
    
    color: "#FFF",
  },
  
  finishButtonText: {
    
    color: "#FFF",
  },
});
