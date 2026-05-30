/*
 * File: src\screens\PlanEventScreen.jsx
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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// Import project dependencies
import React, { useState } from "react";
// Import project dependencies
import { useNavigation } from "@react-navigation/native";
// Import project dependencies
import { storage, RBAC } from "../utils/storage";
// Import project dependencies
import { sendLocalNotification } from "../utils/notifications";
// Import project dependencies
import { Input, Button, Card } from "../components";

const NativeDateTimePicker =
  Platform.OS === "web"
    ? null
    : require("@react-native-community/datetimepicker").default;

// Define a function or component using an arrow function
const PlanEventScreen = () => {
  // Declare a constant or variable
  const navigation = useNavigation();
  // Declare a constant or variable
  const [step, setStep] = useState(1);
  // Declare a constant or variable
  const [loading, setLoading] = useState(false);
  // Declare a constant or variable
  const [userData, setUserData] = useState(null);
  // Declare a constant or variable
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Declare a constant or variable
  const [pickerDate, setPickerDate] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour;
  });
  // Declare a constant or variable
  const [blastData, setBlastData] = useState({
    // Style object property
    title: "",
    // Style object property
    description: "",
    // Style object property
    launchDate: "",
    // Style object property
    blastSize: "",
    // Style object property
    targetArea: "",
    // Style object property
    holes: "",
    // Style object property
    explosivesUsed: "ANFO",
    // Style object property
    detonationPattern: "Electronic sequencing",
  });

  // Safety Checklist - Mine specific
  // Declare a constant or variable
  const [checks, setChecks] = useState({
    // Style object property
    siteClear: false,
    // Style object property
    equipmentReady: false,
    // Style object property
    blastPatternVerified: false,
    // Style object property
    safetyPersonPresent: false,
  });

  // Declare a constant or variable
  const isSafetyComplete = Object.values(checks).every((val) => val === true);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const formatLaunchDateForDisplay = (value) => {
    if (!value) {
      return "Tap to choose date and time";
    }

    const parsedDate = new Date(value.replace(" ", "T"));
    if (isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getDefaultLaunchDate = () => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour;
  };

  const updateLaunchDate = (date) => {
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    setBlastData((prev) => ({ ...prev, launchDate: formatted }));
  };

  const openLaunchDatePicker = () => {
    if (Platform.OS === "web") {
      return;
    }

    const currentDate = blastData.launchDate
      ? new Date(blastData.launchDate.replace(" ", "T"))
      : getDefaultLaunchDate();

    if (isNaN(currentDate.getTime())) {
      setPickerDate(getDefaultLaunchDate());
    } else {
      setPickerDate(currentDate);
    }

    setShowDatePicker(true);
  };

  const handleLaunchDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    setPickerDate(selectedDate);
    updateLaunchDate(selectedDate);
  };

  // Define a function or component using an arrow function
  const loadUserData = async () => {
    // Declare a constant or variable
    const user = await storage.getUserData();
    setUserData(user);

    // Check if user is admin
    const isAdmin = RBAC.isCompanyAdmin(user?.uid, user?.company);

    // Check if user can edit
    // Control flow statement
    if (!RBAC.canEditBlasts(user?.minePosition, isAdmin)) {
      Alert.alert(
        "Permission Denied",
        `Your position (${user?.minePosition}) does not have permission to plan blast operations. Only Engineers, Specialists, Analysts, or Company Admins can perform this action.`,
        [{ text: "Go Back", onPress: () => navigation.goBack() }],
      );
    }
  };

  // Define a function or component using an arrow function
  const validateStep1 = () => {
    // Control flow statement
    if (!blastData.title.trim()) {
      Alert.alert(
        "Input Error",
        "Please provide a name for this blast operation.",
      );
      // Return a value from the function
      return false;
    }

    // Control flow statement
    if (!blastData.targetArea.trim()) {
      Alert.alert("Input Error", "Please specify the target area/zone.");
      // Return a value from the function
      return false;
    }

    // Control flow statement
    if (!blastData.blastSize.trim() || isNaN(blastData.blastSize)) {
      Alert.alert("Input Error", "Please enter blast size in kg.");
      // Return a value from the function
      return false;
    }

    // Control flow statement
    if (!blastData.holes.trim() || isNaN(blastData.holes)) {
      Alert.alert("Input Error", "Please enter number of holes.");
      // Return a value from the function
      return false;
    }

    // Basic date validation (YYYY-MM-DD HH:MM)
    // Declare a constant or variable
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    // Control flow statement
    if (!dateRegex.test(blastData.launchDate)) {
      Alert.alert(
        "Date Error",
        "Please choose a launch date and time using the picker.",
      );
      // Return a value from the function
      return false;
    }

    // Declare a constant or variable
    const targetDate = new Date(
      blastData.launchDate.replace(" ", "T"),
    ).getTime();
    // Control flow statement
    if (isNaN(targetDate) || targetDate <= Date.now()) {
      Alert.alert("Time Error", "Launch time must be in the future.");
      // Return a value from the function
      return false;
    }

    // Return a value from the function
    return true;
  };

  // Define a function or component using an arrow function
  const handleSchedule = async () => {
    // Control flow statement
    if (!isSafetyComplete) {
      Alert.alert(
        "Safety Warning",
        "All safety checks must be cleared before this blast can be scheduled.",
      );
      return;
    }

    setLoading(true);
    // Declare a constant or variable
    const newBlast = {
      ...blastData,
      // Style object property
      status: "Scheduled",
      companyCode: userData?.companyCode,
      createdByName: userData?.name || "Unknown",
      checks,
    };

    // Declare a constant or variable
    const saved = await storage.saveBlast(newBlast);

    setLoading(false);
    // Control flow statement
    if (saved) {
      // Send a local notification to confirm scheduling
      await sendLocalNotification(
        "Blast Scheduled! ",
        `Operation "${blastData.title}" is set for ${blastData.launchDate}.`,
      );

      Alert.alert(
        "Success",
        "Blast operation is now scheduled and the countdown has begun.",
        [
          {
            // Style object property
            text: "View Dashboard",
            // Style object property
            onPress: () => navigation.navigate("Dashboard"),
          },
        ],
      );
    } else {
      Alert.alert(
        "Error",
        "Failed to schedule blast operation. Please try again.",
      );
    }
  };

  // Define a function or component using an arrow function
  const renderStep = () => {
    // Control flow statement
    if (step === 1) {
      // Return JSX layout
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⛏️ Blast Details</Text>

          <Input
            label="Operation Name *"
            placeholder="e.g., East Pit Zone A"
            value={blastData.title}
            onChangeText={(t) => setBlastData({ ...blastData, title: t })}
          />

          <Input
            label="Target Area/Zone *"
            placeholder="e.g., Zone A - East Pit"
            value={blastData.targetArea}
            onChangeText={(t) => setBlastData({ ...blastData, targetArea: t })}
          />

          <Input
            label="Description"
            placeholder="e.g., Primary ore extraction"
            value={blastData.description}
            onChangeText={(t) => setBlastData({ ...blastData, description: t })}
            multiline
          />

          <Input
            label="Blast Size (kg) *"
            placeholder="e.g., 50"
            keyboardType="decimal-pad"
            value={blastData.blastSize}
            onChangeText={(t) => setBlastData({ ...blastData, blastSize: t })}
          />

          <Input
            label="Number of Holes *"
            placeholder="e.g., 45"
            keyboardType="number-pad"
            value={blastData.holes}
            onChangeText={(t) => setBlastData({ ...blastData, holes: t })}
          />

          <Input
            label="Explosives Used"
            placeholder="e.g., ANFO, Dynamite"
            value={blastData.explosivesUsed}
            onChangeText={(value) =>
              setBlastData({ ...blastData, explosivesUsed: value })
            }
          />

          <Input
            label="Detonation Pattern"
            placeholder="e.g., Electronic sequencing"
            value={blastData.detonationPattern}
            onChangeText={(value) =>
              setBlastData({ ...blastData, detonationPattern: value })
            }
          />

          {Platform.OS === "web" ? (
            <Input
              label="Scheduled Date/Time *"
              placeholder="YYYY-MM-DD HH:MM"
              value={blastData.launchDate}
              onChangeText={(value) =>
                setBlastData((prev) => ({ ...prev, launchDate: value }))
              }
            />
          ) : (
            <Pressable
              style={styles.datePickerButton}
              onPress={openLaunchDatePicker}
            >
              <View style={styles.datePickerContent}>
                <Text style={styles.datePickerLabel}>
                  Scheduled Date/Time *
                </Text>
                <Text style={styles.datePickerText}>
                  {formatLaunchDateForDisplay(blastData.launchDate)}
                </Text>
              </View>
              <Text style={styles.datePickerIcon}>📅</Text>
            </Pressable>
          )}

          {showDatePicker && NativeDateTimePicker && (
            <NativeDateTimePicker
              value={pickerDate}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handleLaunchDateChange}
            />
          )}

          <Text style={styles.formatNote}>
            {Platform.OS === "web"
              ? "Type the date and time as YYYY-MM-DD HH:MM on web."
              : "Tap the date card to choose a date and time."}
          </Text>

          <Button
            label="Continue to Safety Checks"
            onPress={() => {
              if (validateStep1()) setStep(2);
            }}
            style={styles.primaryButton}
          />
        </View>
      );
    }

    // Return JSX layout
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}> Safety Verification</Text>
        <Text style={styles.stepDescription}>
          Verify the following requirements to unlock the blast timer. All items
          are MANDATORY.
        </Text>

        <Card style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Site Clear of Personnel</Text>
            <Text style={styles.checkSub}>
              Blast radius is secured and empty
            </Text>
          </View>
          <Switch
            value={checks.siteClear}
            onValueChange={(v) => setChecks({ ...checks, siteClear: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </Card>

        <Card style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Equipment Ready</Text>
            <Text style={styles.checkSub}>
              All equipment tested and operational
            </Text>
          </View>
          <Switch
            value={checks.equipmentReady}
            onValueChange={(v) => setChecks({ ...checks, equipmentReady: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </Card>

        <Card style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Blast Pattern Verified</Text>
            <Text style={styles.checkSub}>
              Hole configuration and spacing approved
            </Text>
          </View>
          <Switch
            value={checks.blastPatternVerified}
            onValueChange={(v) =>
              setChecks({ ...checks, blastPatternVerified: v })
            }
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </Card>

        <Card style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Safety Officer Present</Text>
            <Text style={styles.checkSub}>
              Authorized safety personnel on-site
            </Text>
          </View>
          <Switch
            value={checks.safetyPersonPresent}
            onValueChange={(v) =>
              setChecks({ ...checks, safetyPersonPresent: v })
            }
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </Card>

        <Button
          label={
            isSafetyComplete
              ? "💥 Initialize Blast Countdown"
              : "Complete All Checks"
          }
          onPress={handleSchedule}
          disabled={!isSafetyComplete || loading}
          style={styles.scheduleButton}
        />

        <Pressable
          style={styles.backLink}
          onPress={() => setStep(1)}
          disabled={loading}
        >
          <Text style={styles.backLinkText}>Edit Details</Text>
        </Pressable>
      </View>
    );
  };

  // Return JSX layout
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Schedule Blast Operation</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Export the default component or module
export default PlanEventScreen;

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
  closeButton: { padding: 5 },
  // Style object property
  closeButtonText: { color: "#FFF", fontSize: 20 },
  // Style object property
  content: { padding: 25 },
  // Style object property
  section: { width: "100%" },
  // Style object property
  sectionTitle: {
    // Style object property
    fontSize: 22,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#1A1F3A",
    // Style object property
    marginBottom: 10,
  },
  // Style object property
  stepDescription: { fontSize: 14, color: "#95A5A6", marginBottom: 30 },
  // Style object property
  label: {
    // Style object property
    fontSize: 14,
    // Style object property
    fontWeight: "600",
    // Style object property
    color: "#2C3E50",
    // Style object property
    marginBottom: 8,
    // Style object property
    marginTop: 15,
  },
  // Style object property
  input: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 12,
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
    borderRadius: 12,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
    // Style object property
    overflow: "hidden",
    // Style object property
    marginTop: 8,
  },
  // Style object property
  checkItem: {
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
    marginBottom: 15,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#ECF0F1",
  },
  // Style object property
  checkLabel: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  // Style object property
  checkSub: { fontSize: 12, color: "#95A5A6", marginTop: 2 },
  // Style object property
  primaryButton: {
    // Style object property
    backgroundColor: "#1A1F3A",
    // Style object property
    borderRadius: 12,
    // Style object property
    paddingVertical: 18,
    // Style object property
    alignItems: "center",
    // Style object property
    marginTop: 30,
  },
  // Style object property
  scheduleButton: {
    // Style object property
    backgroundColor: "#FF9900",
    // Style object property
    borderRadius: 12,
    // Style object property
    paddingVertical: 18,
    // Style object property
    alignItems: "center",
    // Style object property
    marginTop: 30,
    // Style object property
    shadowColor: "#FF9900",
    // Style object property
    shadowOffset: { width: 0, height: 4 },
    // Style object property
    shadowOpacity: 0.3,
    // Style object property
    shadowRadius: 8,
    // Style object property
    elevation: 5,
  },
  // Style object property
  disabledButton: {
    // Style object property
    backgroundColor: "#BDC3C7",
    // Style object property
    shadowOpacity: 0,
    // Style object property
    elevation: 0,
  },
  // Style object property
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  // Style object property
  datePickerButton: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    borderRadius: 12,
    // Style object property
    padding: 16,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
    // Style object property
    marginTop: 10,
    // Style object property
    flexDirection: "row",
    // Style object property
    justifyContent: "space-between",
    // Style object property
    alignItems: "center",
  },
  // Style object property
  datePickerContent: { flex: 1 },
  // Style object property
  datePickerLabel: {
    // Style object property
    fontSize: 14,
    // Style object property
    fontWeight: "600",
    // Style object property
    color: "#1A1F3A",
    // Style object property
    marginBottom: 6,
  },
  // Style object property
  datePickerText: { fontSize: 16, color: "#2C3E50" },
  // Style object property
  datePickerIcon: { fontSize: 22, marginLeft: 12 },
  // Style object property
  formatNote: { fontSize: 11, color: "#95A5A6", marginTop: 5, marginLeft: 5 },
  // Style object property
  backLink: { marginTop: 20, alignItems: "center" },
  // Style object property
  backLinkText: { color: "#95A5A6", fontWeight: "600" },
});
