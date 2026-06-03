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

import React, { useState } from "react";

import { useNavigation } from "@react-navigation/native";

import { storage, RBAC } from "../utils/storage";

import { sendLocalNotification } from "../utils/notifications";

import { Input, Button, Card } from "../components";

const NativeDateTimePicker =
  Platform.OS === "web"
    ? null
    : require("@react-native-community/datetimepicker").default;

const PlanEventScreen = () => {
  const navigation = useNavigation();

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [pickerDate, setPickerDate] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour;
  });

  const [blastData, setBlastData] = useState({
    title: "",
    
    description: "",
    
    launchDate: "",
    
    blastSize: "",
    
    targetArea: "",
    
    holes: "",
    
    explosivesUsed: "ANFO",

    detonationPattern: "Electronic sequencing",
  });

  const [checks, setChecks] = useState({
    siteClear: false,

    equipmentReady: false,

    blastPatternVerified: false,

    safetyPersonPresent: false,
  });

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

  const loadUserData = async () => {
    const user = await storage.getUserData();
    setUserData(user);

    const isAdmin = RBAC.isCompanyAdmin(user?.uid, user?.company);

    if (!RBAC.canEditBlasts(user?.minePosition, isAdmin)) {
      Alert.alert(
        "Permission Denied",
        `Your position (${user?.minePosition}) does not have permission to plan blast operations. Only Engineers, Specialists, Analysts, or Company Admins can perform this action.`,
        [{ text: "Go Back", onPress: () => navigation.goBack() }],
      );
    }
  };

  const validateStep1 = () => {
    const MAX_SCHEDULE_WINDOW_MS = 24 * 60 * 60 * 1000;

    if (!blastData.title.trim()) {
      Alert.alert(
        "Input Error",
        "Please provide a name for this blast operation.",
      );

      return false;
    }

    if (!blastData.targetArea.trim()) {
      Alert.alert("Input Error", "Please specify the target area/zone.");

      return false;
    }

    if (!blastData.blastSize.trim() || isNaN(blastData.blastSize)) {
      Alert.alert("Input Error", "Please enter blast size in kg.");

      return false;
    }

    if (!blastData.holes.trim() || isNaN(blastData.holes)) {
      Alert.alert("Input Error", "Please enter number of holes.");

      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

    if (!dateRegex.test(blastData.launchDate)) {
      Alert.alert(
        "Date Error",
        "Please choose a launch date and time using the picker.",
      );

      return false;
    }

    const targetDate = new Date(
      blastData.launchDate.replace(" ", "T"),
    ).getTime();

    if (isNaN(targetDate) || targetDate <= Date.now()) {
      Alert.alert("Time Error", "Launch time must be in the future.");
      return false;
    }

    const maxAllowedDate = Date.now() + MAX_SCHEDULE_WINDOW_MS;
    if (targetDate > maxAllowedDate) {
      Alert.alert(
        "Schedule Window Error",
        "Blast operations can only be scheduled within the next 24 hours.",
      );
      return false;
    }

    return true;
  };

  const handleSchedule = async () => {
    if (!isSafetyComplete) {
      Alert.alert(
        "Safety Warning",
        "All safety checks must be cleared before this blast can be scheduled.",
      );
      return;
    }

    setLoading(true);

    const newBlast = {
      ...blastData,

      status: "Scheduled",
      companyCode: userData?.companyCode,
      createdByName: userData?.name || "Unknown",
      checks,
    };

    const saved = await storage.saveBlast(newBlast);

    setLoading(false);

    if (saved) {
      await sendLocalNotification(
        "Blast Warning",
        `Operation "${blastData.title}" is scheduled for ${blastData.launchDate}. This record is locked for editing until the blast window finishes.`,
      );

      Alert.alert(
        "Success",
        "Blast operation is now scheduled. It is locked for edits until the countdown finishes.",
        [
          {
            text: "View Dashboard",

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

  const renderStep = () => {
    if (step === 1) {
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

export default PlanEventScreen;

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

  closeButton: { padding: 5 },

  closeButtonText: { color: "#FFF", fontSize: 20 },

  content: { padding: 25 },

  section: { width: "100%" },

  sectionTitle: {
    fontSize: 22,

    fontWeight: "bold",

    color: "#1A1F3A",

    marginBottom: 10,
  },

  stepDescription: { fontSize: 14, color: "#95A5A6", marginBottom: 30 },

  label: {
    fontSize: 14,

    fontWeight: "600",

    color: "#2C3E50",

    marginBottom: 8,

    marginTop: 15,
  },

  input: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 15,

    fontSize: 16,

    borderWidth: 1,

    borderColor: "#E0E0E0",
  },

  pickerContainer: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    borderWidth: 1,

    borderColor: "#E0E0E0",

    overflow: "hidden",

    marginTop: 8,
  },

  checkItem: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF",

    padding: 15,

    borderRadius: 12,

    marginBottom: 15,

    borderWidth: 1,

    borderColor: "#ECF0F1",
  },

  checkLabel: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },

  checkSub: { fontSize: 12, color: "#95A5A6", marginTop: 2 },

  primaryButton: {
    backgroundColor: "#1A1F3A",

    borderRadius: 12,

    paddingVertical: 18,

    alignItems: "center",

    marginTop: 30,
  },

  scheduleButton: {
    backgroundColor: "#FF9900",

    borderRadius: 12,

    paddingVertical: 18,

    alignItems: "center",

    marginTop: 30,

    shadowColor: "#FF9900",

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.3,

    shadowRadius: 8,

    elevation: 5,
  },

  disabledButton: {
    backgroundColor: "#BDC3C7",

    shadowOpacity: 0,

    elevation: 0,
  },

  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },

  datePickerButton: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 16,

    borderWidth: 1,

    borderColor: "#E0E0E0",

    marginTop: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  datePickerContent: { flex: 1 },

  datePickerLabel: {
    fontSize: 14,

    fontWeight: "600",

    color: "#1A1F3A",

    marginBottom: 6,
  },

  datePickerText: { fontSize: 16, color: "#2C3E50" },

  datePickerIcon: { fontSize: 22, marginLeft: 12 },

  formatNote: { fontSize: 11, color: "#95A5A6", marginTop: 5, marginLeft: 5 },

  backLink: { marginTop: 20, alignItems: "center" },

  backLinkText: { color: "#95A5A6", fontWeight: "600" },
});
