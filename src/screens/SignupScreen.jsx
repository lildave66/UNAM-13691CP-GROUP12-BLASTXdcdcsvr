




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

import { MINE_ROLES, RBAC, storage } from "../utils/storage";

import { auth, db } from "../utils/firebase";

import { createUserWithEmailAndPassword } from "firebase/auth";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { Input, Button } from "../components";


const SignupScreen = () => {
  
  const navigation = useNavigation();
  
  const [name, setName] = useState("");
  
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [companyCode, setCompanyCode] = useState("");
  
  const [minePosition, setMinePosition] = useState(MINE_ROLES.ENGINEER); 
  
  const [loading, setLoading] = useState(false);

  
  const generateCode = () => {
    
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  
  const handleSignup = async () => {
    
    
    if (!name || !email || !password || !confirmPassword || !minePosition) {
      Alert.alert("Error", "Please fill in all fields including your position");
      return;
    }

    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      
      const user = userCredential.user;

      
      let finalCode = companyCode.trim().toUpperCase();
      
      let isJoining = !!finalCode;

      
      
      if (isJoining) {
        
        const companyDoc = await getDoc(doc(db, "companies", finalCode));
        
        if (!companyDoc.exists()) {
          throw new Error("Invalid company code. Please check and try again.");
        }
      } else {
        
        finalCode = generateCode();
        
        await setDoc(doc(db, "companies", finalCode), {
          name: "New Mining Operation",
          registeredBy: user.uid,
          createdAt: serverTimestamp(),
          rbacEnabled: true,
        });
      }

      
      
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        companyCode: finalCode,
        minePosition,
        canCreateBlasts: RBAC.canCreateBlasts(minePosition),
        createdAt: serverTimestamp(),
      });

      
      
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

          {}
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


export default SignupScreen;


const styles = StyleSheet.create({
  
  container: {
    
    flex: 1,
    
    backgroundColor: "#F8F9FA",
  },
  
  scrollContent: {
    
    flexGrow: 1,
    
    paddingHorizontal: 25,
    
    paddingTop: 60,
    
    paddingBottom: 40,
  },
  
  header: {
    
    alignItems: "center",
    
    marginBottom: 30,
  },
  
  logo: {
    
    width: 80,
    
    height: 80,
    
    borderRadius: 15,
    
    marginBottom: 15,
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
    
    marginBottom: 15,
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
  },
  
  positionGrid: {
    
    flexDirection: "row",
    
    flexWrap: "wrap",
    
    marginHorizontal: -6,
  },
  
  positionButton: {
    
    backgroundColor: "#FFF",
    
    paddingVertical: 10,
    
    paddingHorizontal: 12,
    
    borderRadius: 10,
    
    borderWidth: 1,
    
    borderColor: "#E0E0E0",
    
    marginBottom: 10,
    
    marginHorizontal: 6,
  },
  
  positionButtonActive: {
    
    backgroundColor: "#FF9900",
    
    borderColor: "#FF9900",
  },
  
  positionText: {
    
    color: "#1A1F3A",
    
    fontSize: 13,
    
    fontWeight: "600",
  },
  
  positionTextActive: {
    
    color: "#FFF",
  },
  
  positionInfo: {
    
    fontSize: 12,
    
    color: "#FF9900",
    
    marginTop: 6,
    
    marginLeft: 4,
    
    fontStyle: "italic",
  },
  
  signupButton: {
    
    backgroundColor: "#FF9900",
    
    borderRadius: 12,
    
    paddingVertical: 18,
    
    alignItems: "center",
    
    marginTop: 15,
    
    shadowColor: "#FF9900",
    
    shadowOffset: { width: 0, height: 4 },
    
    shadowOpacity: 0.3,
    
    shadowRadius: 8,
    
    elevation: 5,
  },
  
  signupButtonText: {
    
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
  
  loginLink: {
    
    fontSize: 15,
    
    color: "#FF9900",
    
    fontWeight: "bold",
  },
});
