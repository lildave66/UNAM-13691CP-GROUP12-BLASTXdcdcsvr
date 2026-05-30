/*
 * File: src\screens\LoginScreen.jsx
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
import { auth, db } from "../utils/firebase";
// Import project dependencies
import { signInWithEmailAndPassword } from "firebase/auth";
// Import project dependencies
import { doc, getDoc } from "firebase/firestore";
// Import project dependencies
import { Input, Button } from "../components";

// Define a function or component using an arrow function
const LoginScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();
// Declare a constant or variable
  const [email, setEmail] = useState("");
// Declare a constant or variable
  const [password, setPassword] = useState("");
// Declare a constant or variable
  const [loading, setLoading] = useState(false);

// Define a function or component using an arrow function
  const handleLogin = async () => {
// Control flow statement
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
// Control flow statement
    try {
// Declare a constant or variable
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
// Declare a constant or variable
      const user = userCredential.user;

      // Verify user exists in Firestore
// Declare a constant or variable
      const userDoc = await getDoc(doc(db, "users", user.uid));
// Control flow statement
      if (!userDoc.exists()) {
        Alert.alert("Error", "User profile not found. Please sign up again.");
      }
    } catch (error) {
      console.error(error);
// Declare a constant or variable
      let message = "An unexpected error occurred.";
// Control flow statement
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "Invalid email or password.";
      }
      Alert.alert("Login Failed", message);
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
          <Text style={styles.title}>Mine Blast Control</Text>
          <Text style={styles.subtitle}>Access your blast operations</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>

          <Button
            label="Login"
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Export the default component or module
export default LoginScreen;

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
    paddingTop: 80,
// Style object property
    paddingBottom: 40,
  },
// Style object property
  header: {
// Style object property
    alignItems: "center",
// Style object property
    marginBottom: 40,
  },
// Style object property
  logo: {
// Style object property
    width: 100,
// Style object property
    height: 100,
// Style object property
    borderRadius: 20,
// Style object property
    marginBottom: 20,
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
    marginBottom: 20,
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
// Style object property
    shadowColor: "#000",
// Style object property
    shadowOffset: { width: 0, height: 1 },
// Style object property
    shadowOpacity: 0.05,
// Style object property
    shadowRadius: 2,
// Style object property
    elevation: 1,
  },
// Style object property
  forgotPassword: {
// Style object property
    alignSelf: "flex-end",
// Style object property
    marginBottom: 30,
  },
// Style object property
  forgotPasswordText: {
// Style object property
    color: "#FF9900",
// Style object property
    fontWeight: "600",
// Style object property
    fontSize: 14,
  },
// Style object property
  loginButton: {
// Style object property
    backgroundColor: "#FF9900",
// Style object property
    borderRadius: 12,
// Style object property
    paddingVertical: 18,
// Style object property
    alignItems: "center",
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
  loginButtonText: {
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
  signupLink: {
// Style object property
    fontSize: 15,
// Style object property
    color: "#FF9900",
// Style object property
    fontWeight: "bold",
  },
});
