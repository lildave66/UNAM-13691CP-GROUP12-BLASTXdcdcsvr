




import React from "react";

import { SafeAreaView, StyleSheet } from "react-native";


const ScreenWrapper = ({ children, style }) => {

  return (
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
  );
};


export default ScreenWrapper;


const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F8F9FA",
  },
});
