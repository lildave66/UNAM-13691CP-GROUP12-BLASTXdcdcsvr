






import React from "react";

import { StyleSheet, Pressable, Text, View } from "react-native";


const FAB = ({ onPress }) => {

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.plus}>＋</Text>
      </Pressable>
    </View>
  );
};


export default FAB;


const styles = StyleSheet.create({

  container: {

    position: "absolute",

    right: 18,

    bottom: 26,

    zIndex: 50,
  },

  button: {

    width: 60,

    height: 60,

    borderRadius: 30,

    backgroundColor: "#FF9900",

    justifyContent: "center",

    alignItems: "center",

    elevation: 6,

    shadowColor: "#FF9900",

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.3,

    shadowRadius: 8,
  },

  plus: {

    color: "#FFF",

    fontSize: 32,

    lineHeight: 34,

    fontWeight: "700",
  },

  label: {

    display: "none",
  },
});
