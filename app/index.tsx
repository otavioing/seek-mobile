import { useRouter } from 'expo-router';
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Logo from "../assets/images/logoSplash.png";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/login'), 3000);
    return () => clearTimeout(timer);
  }, []);

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