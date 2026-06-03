




import { StyleSheet, Text, View, Image, ActivityIndicator, Pressable } from "react-native";

import React, { useEffect, useState } from "react";

import { useNavigation } from "@react-navigation/native";

import { storage } from "../utils/storage";

import logo from "../utils/assets/images/icon.png";

import { Button, ScreenWrapper, Spacer } from "../components";


const HomeScreen = () => {

  const navigation = useNavigation();


  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} />
        <Spacer size={32} />
        <Text style={styles.title}>BlastX</Text>
        <Spacer size={12} />
        <Text style={styles.subtitle}>
          Mine blast scheduling made simple.
        </Text>
        <Spacer size={40} />
        <Button
          label="Get Started"
          onPress={() => navigation.navigate("Signup")}
          style={styles.button}
        />
        <Spacer size={16} />
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: "#FF9900", fontWeight: "bold" }}>Login to Existing Account</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};


export default HomeScreen;


const styles = StyleSheet.create({

  wrapper: {

    justifyContent: "center",

    paddingHorizontal: 28,
  },

  center: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  content: {

    alignItems: "center",

    paddingVertical: 80,
  },

  logo: {

    width: 140,

    height: 140,

    borderRadius: 28,
  },

  title: {

    fontSize: 36,

    fontWeight: "bold",

    color: "#1A1F3A",

    textAlign: "center",
  },

  subtitle: {

    fontSize: 16,

    color: "#6B7280",

    textAlign: "center",

    lineHeight: 24,

    marginHorizontal: 10,
  },

  button: {

    minWidth: 220,
  },
});
