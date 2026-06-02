






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

import React, { useState } from "react";

import { useNavigation } from "@react-navigation/native";

import logo from "../utils/assets/images/icon.png";

import { auth, db } from "../utils/firebase";

import { signInWithEmailAndPassword } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { Input, Button } from "../components";


const LoginScreen = () => {

  const navigation = useNavigation();

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

    try {

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        Alert.alert("Error", "User profile not found. Please sign up again.");
      }
    } catch (error) {
      console.error(error);

      let message = "An unexpected error occurred.";

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


export default LoginScreen;


const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F8F9FA",
  },

  scrollContent: {

    flexGrow: 1,

    paddingHorizontal: 25,

    paddingTop: 80,

    paddingBottom: 40,
  },

  header: {

    alignItems: "center",

    marginBottom: 40,
  },

  logo: {

    width: 100,

    height: 100,

    borderRadius: 20,

    marginBottom: 20,
  },

  title: {

    fontSize: 28,

    fontWeight: "bold",

    color: "#1A1F3A",

    marginBottom: 8,
  },

  subtitle: {

    fontSize: 16,

    color: "#95A5A6",
  },

  form: {

    width: "100%",
  },

  inputContainer: {

    marginBottom: 20,
  },

  label: {

    fontSize: 14,

    fontWeight: "600",

    color: "#1A1F3A",

    marginBottom: 8,

    marginLeft: 4,
  },

  input: {

    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 15,

    fontSize: 16,

    borderWidth: 1,

    borderColor: "#E0E0E0",

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.05,

    shadowRadius: 2,

    elevation: 1,
  },

  forgotPassword: {

    alignSelf: "flex-end",

    marginBottom: 30,
  },

  forgotPasswordText: {

    color: "#FF9900",

    fontWeight: "600",

    fontSize: 14,
  },

  loginButton: {

    backgroundColor: "#FF9900",

    borderRadius: 12,

    paddingVertical: 18,

    alignItems: "center",

    shadowColor: "#FF9900",

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.3,

    shadowRadius: 8,

    elevation: 5,
  },

  loginButtonText: {

    color: "#FFF",

    fontSize: 18,

    fontWeight: "bold",
  },

  footer: {

    flexDirection: "row",

    justifyContent: "center",

    marginTop: 25,
  },

  footerText: {

    fontSize: 15,

    color: "#95A5A6",
  },

  signupLink: {

    fontSize: 15,

    color: "#FF9900",

    fontWeight: "bold",
  },
});
