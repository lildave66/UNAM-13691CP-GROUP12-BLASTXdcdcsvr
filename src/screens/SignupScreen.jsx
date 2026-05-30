/*
 * File: src\screens\SignupScreen.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
// Import project dependencies
import React, { useState } from "react";
// Import project dependencies
import { useNavigation } from "@react-navigation/native";
// Import project dependencies
import logo from "../utils/assets/images/icon.png";
// Import project dependencies
import { MINE_ROLES, RBAC, storage } from "../utils/storage";
// Import project dependencies
import { auth, db } from "../utils/firebase";
// Import project dependencies
import { createUserWithEmailAndPassword } from "firebase/auth";
// Import project dependencies
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
// Import project dependencies
import { Input, Button } from "../components";

// Define a function or component using an arrow function
const SignupScreen = () => {
  // Declare a constant or variable
  const navigation = useNavigation();
  // Declare a constant or variable
  const [name, setName] = useState("");
  // Declare a constant or variable
  const [email, setEmail] = useState("");
  // Declare a constant or variable
  const [password, setPassword] = useState("");
  // Declare a constant or variable
  const [confirmPassword, setConfirmPassword] = useState("");
  // Declare a constant or variable
  const [companyCode, setCompanyCode] = useState("");
  // Declare a constant or variable
  const [minePosition, setMinePosition] = useState(MINE_ROLES.ENGINEER); // NEW: Position selection
  // Declare a constant or variable
  const [loading, setLoading] = useState(false);

  // Define a function or component using an arrow function
  const generateCode = () => {
    // Return a value from the function
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Define a function or component using an arrow function
  const handleSignup = async () => {
    // Validate all fields including position
    // Control flow statement
    if (!name || !email || !password || !confirmPassword || !minePosition) {
      Alert.alert("Error", "Please fill in all fields including your position");
      return;
    }

    // Control flow statement
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    // Control flow statement
    try {
      // Declare a constant or variable
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Declare a constant or variable
      const user = userCredential.user;

      // Declare a constant or variable
      let finalCode = companyCode.trim().toUpperCase();
      // Declare a constant or variable
      let isJoining = !!finalCode;

      // If joining, verify code exists
      // Control flow statement
      if (isJoining) {
        // Declare a constant or variable
        const companyDoc = await getDoc(doc(db, "companies", finalCode));
        // Control flow statement
        if (!companyDoc.exists()) {
          throw new Error("Invalid company code. Please check and try again.");
        }
      } else {
        // Creating new company
        finalCode = generateCode();
        // Wait for an asynchronous operation
        await setDoc(doc(db, "companies", finalCode), {
          name: "New Mining Operation",
          registeredBy: user.uid,
          createdAt: serverTimestamp(),
          rbacEnabled: true,
        });
      }

      // Create user profile
      // Wait for an asynchronous operation
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        companyCode: finalCode,
        minePosition,
        canCreateBlasts: RBAC.canCreateBlasts(minePosition),
        createdAt: serverTimestamp(),
      });

      // Add to team collection
      // Wait for an asynchronous operation
      await setDoc(doc(db, "companies", finalCode, "team", user.uid), {
        name,
        email,
        minePosition,
        canCreateBlasts: RBAC.canCreateBlasts(minePosition),
        joinedAt: serverTimestamp(),
      });

      Alert.alert(
        "Success",
        `Account created!\n\nRole: ${minePosition}\nCompany Code: ${finalCode}`,
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate(isJoining ? "Dashboard" : "Setup"),
          },
        ],
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Return JSX layout
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.title}>Mine Blast Operations</Text>
          <Text style={styles.subtitle}>Create Account & Join Your Mine</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* NEW: Mine Position Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Position in Mine *</Text>
            <View style={styles.positionGrid}>
              {Object.values(MINE_ROLES).map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setMinePosition(role)}
                  style={[
                    styles.positionButton,
                    minePosition === role && styles.positionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.positionText,
                      minePosition === role && styles.positionTextActive,
                    ]}
                  >
                    {role}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.positionInfo}>
              {["Engineer", "Specialist", "Analyst"].includes(minePosition)
                ? "✓ Can edit and record blast data"
                : "• Can view records (read-only)"}
            </Text>
          </View>

          <Input
            label="Company Code (Optional)"
            placeholder="Enter code to join, or leave blank to create"
            value={companyCode}
            onChangeText={setCompanyCode}
            autoCapitalize="characters"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            label="Sign Up"
            onPress={handleSignup}
            disabled={loading}
            style={styles.signupButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Export the default component or module
export default SignupScreen;

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
    flexGrow: 1,
    // Style object property
    paddingHorizontal: 25,
    // Style object property
    paddingTop: 60,
    // Style object property
    paddingBottom: 40,
  },
  // Style object property
  header: {
    // Style object property
    alignItems: "center",
    // Style object property
    marginBottom: 30,
  },
  // Style object property
  logo: {
    // Style object property
    width: 80,
    // Style object property
    height: 80,
    // Style object property
    borderRadius: 15,
    // Style object property
    marginBottom: 15,
  },
  // Style object property
  title: {
    // Style object property
    fontSize: 28,
    // Style object property
    fontWeight: "bold",
    // Style object property
    color: "#1A1F3A",
    // Style object property
    marginBottom: 8,
  },
  // Style object property
  subtitle: {
    // Style object property
    fontSize: 16,
    // Style object property
    color: "#95A5A6",
  },
  // Style object property
  form: {
    // Style object property
    width: "100%",
  },
  // Style object property
  inputContainer: {
    // Style object property
    marginBottom: 15,
  },
  // Style object property
  label: {
    // Style object property
    fontSize: 14,
    // Style object property
    fontWeight: "600",
    // Style object property
    color: "#1A1F3A",
    // Style object property
    marginBottom: 8,
    // Style object property
    marginLeft: 4,
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
  positionGrid: {
    // Style object property
    flexDirection: "row",
    // Style object property
    flexWrap: "wrap",
    // Style object property
    marginHorizontal: -6,
  },
  // Style object property
  positionButton: {
    // Style object property
    backgroundColor: "#FFF",
    // Style object property
    paddingVertical: 10,
    // Style object property
    paddingHorizontal: 12,
    // Style object property
    borderRadius: 10,
    // Style object property
    borderWidth: 1,
    // Style object property
    borderColor: "#E0E0E0",
    // Style object property
    marginBottom: 10,
    // Style object property
    marginHorizontal: 6,
  },
  // Style object property
  positionButtonActive: {
    // Style object property
    backgroundColor: "#FF9900",
    // Style object property
    borderColor: "#FF9900",
  },
  // Style object property
  positionText: {
    // Style object property
    color: "#1A1F3A",
    // Style object property
    fontSize: 13,
    // Style object property
    fontWeight: "600",
  },
  // Style object property
  positionTextActive: {
    // Style object property
    color: "#FFF",
  },
  // Style object property
  positionInfo: {
    // Style object property
    fontSize: 12,
    // Style object property
    color: "#FF9900",
    // Style object property
    marginTop: 6,
    // Style object property
    marginLeft: 4,
    // Style object property
    fontStyle: "italic",
  },
  // Style object property
  signupButton: {
    // Style object property
    backgroundColor: "#FF9900",
    // Style object property
    borderRadius: 12,
    // Style object property
    paddingVertical: 18,
    // Style object property
    alignItems: "center",
    // Style object property
    marginTop: 15,
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
  signupButtonText: {
    // Style object property
    color: "#FFF",
    // Style object property
    fontSize: 18,
    // Style object property
    fontWeight: "bold",
  },
  // Style object property
  footer: {
    // Style object property
    flexDirection: "row",
    // Style object property
    justifyContent: "center",
    // Style object property
    marginTop: 25,
  },
  // Style object property
  footerText: {
    // Style object property
    fontSize: 15,
    // Style object property
    color: "#95A5A6",
  },
  // Style object property
  loginLink: {
    // Style object property
    fontSize: 15,
    // Style object property
    color: "#FF9900",
    // Style object property
    fontWeight: "bold",
  },
});
