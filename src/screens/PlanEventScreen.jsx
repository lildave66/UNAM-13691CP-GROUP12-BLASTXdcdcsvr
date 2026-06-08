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

import { CommonActions, useNavigation } from "@react-navigation/native";

import { storage, RBAC } from "../utils/storage";

import { Input, Button, Card } from "../components";

const PlanEventScreen = () => {
  const navigation = useNavigation();

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState(null);

  const [typedDate, setTypedDate] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return `${nextHour.getFullYear()}-${String(nextHour.getMonth() + 1).padStart(2, "0")}-${String(nextHour.getDate()).padStart(2, "0")}`;
  });

  const [typedTime, setTypedTime] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return `${String(nextHour.getHours()).padStart(2, "0")}:${String(nextHour.getMinutes()).padStart(2, "0")}:${String(nextHour.getSeconds()).padStart(2, "0")}`;
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

  const loadUserData = async () => {
    const user = await storage.getUserData();
    setUserData(user);

    const isAdmin = RBAC.isCompanyAdmin(user?.uid, user?.company);

    if (!RBAC.canEditBlasts(user?.minePosition, isAdmin)) {
      Alert.alert(
        "Permission Denied",
        `Your position (${user?.minePosition}) does not have permission to plan blast operations.`,
        [{ text: "Go Back", onPress: () => navigation.goBack() }],
      );
    }
  };

  const validateStep1 = () => {
    const MAX_SCHEDULE_WINDOW_MS = 24 * 60 * 60 * 1000;

    if (
      !blastData.title.trim() ||
      !blastData.targetArea.trim() ||
      !blastData.blastSize.trim() ||
      !blastData.holes.trim()
    ) {
      Alert.alert(
        "Input Error",
        "Please fill in all required fields marked with *.",
      );
      return false;
    }

    if (isNaN(blastData.blastSize) || isNaN(blastData.holes)) {
      Alert.alert("Input Error", "Size and Holes must be numbers.");
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;

    if (!dateRegex.test(typedDate)) {
      Alert.alert("Date Error", "Please enter date as YYYY-MM-DD");
      return false;
    }

    if (!timeRegex.test(typedTime)) {
      Alert.alert("Time Error", "Please enter time as HH:MM:SS (24h format)");
      return false;
    }

    const launchDateString = `${typedDate} ${typedTime}`;
    const targetDate = new Date(launchDateString.replace(" ", "T")).getTime();

    if (isNaN(targetDate) || targetDate <= Date.now()) {
      Alert.alert("Time Error", "Launch time must be in the future.");
      return false;
    }

    const maxAllowedDate = Date.now() + MAX_SCHEDULE_WINDOW_MS;
    if (targetDate > maxAllowedDate) {
      Alert.alert(
        "Schedule Error",
        "Blasts can only be scheduled within the next 24 hours.",
      );
      return false;
    }

    setBlastData((prev) => ({ ...prev, launchDate: launchDateString }));
    return true;
  };

  const handleSchedule = async () => {
    if (!isSafetyComplete) {
      Alert.alert("Safety Warning", "All safety checks must be cleared.");
      return;
    }

    setLoading(true);

    const launchDateString = `${typedDate} ${typedTime}`;
    const newBlast = {
      ...blastData,
      launchDate: launchDateString,
      status: "Scheduled",
      companyCode: userData?.companyCode,
      createdByName: userData?.name || "Unknown",
      checks,
    };

    const saved = await storage.saveBlast(newBlast);
    setLoading(false);

    if (saved) {
      Alert.alert("Success", "Blast scheduled successfully.", [
        {
          text: "Go to Dashboard",
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
              }),
            );
          },
        },
      ]);
    } else {
      Alert.alert("Error", "Failed to schedule blast.");
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

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Input
              label="Blast Size (kg) *"
              placeholder="e.g., 50"
              keyboardType="decimal-pad"
              value={blastData.blastSize}
              onChangeText={(t) => setBlastData({ ...blastData, blastSize: t })}
              style={{ flex: 1 }}
            />

            <Input
              label="Holes *"
              placeholder="e.g., 45"
              keyboardType="number-pad"
              value={blastData.holes}
              onChangeText={(t) => setBlastData({ ...blastData, holes: t })}
              style={{ flex: 1 }}
            />
          </View>

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

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Input
              label="Set Date (YYYY-MM-DD) *"
              placeholder="2026-06-04"
              value={typedDate}
              onChangeText={setTypedDate}
              style={{ flex: 1.5 }}
            />
            <Input
              label="Set Time (HH:MM:SS) *"
              placeholder="14:30:45"
              value={typedTime}
              onChangeText={setTypedTime}
              style={{ flex: 1 }}
            />
          </View>

          <Text style={styles.formatNote}>
            Enter date and time separately using the fields above.
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
          Verify requirements to unlock the countdown.
        </Text>

        {Object.keys(checks).map((key) => (
          <Card key={key} style={styles.checkItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </Text>
            </View>
            <Switch
              value={checks[key]}
              onValueChange={(v) => setChecks({ ...checks, [key]: v })}
              trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
            />
          </Card>
        ))}

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
        <Text style={styles.headerTitle}>Schedule Blast</Text>
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
  formatNote: { fontSize: 11, color: "#95A5A6", marginTop: 5, marginLeft: 5 },
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
  },
  backLink: { marginTop: 20, alignItems: "center" },
  backLinkText: { color: "#95A5A6", fontWeight: "600" },
});
