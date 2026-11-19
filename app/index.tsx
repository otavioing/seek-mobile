import React from "react";
import { Image, StyleSheet, View } from "react-native";
const Logo = require("../assets/images/logo_seek_letrapreta.png");

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image source={Logo} style={{ width: 200, height: 200 }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F0F0F",
  },
});
