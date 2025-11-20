// app/(tabs)/_layout.tsx
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

// >> AJUSTE AQUI o caminho da sua logo <<
const seekLogo = require("../../assets/images/adaptive-icon.png");

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const current = "/" + segments.join("/");

  const isActive = (path) => current.includes(path);
  const go = (path) => router.push(path);

  return (
    <View style={[styles.tabbar, { paddingBottom: insets.bottom || 10 }]}>
      
      {/* LUPA */}
      <TouchableOpacity 
        onPress={() => go("/(tabs)/(home)/tendencias")} 
        style={styles.item}
      >
        <MaterialIcons
          name="search"
          size={30}
          color={isActive("/(home)/tendencias") ? "#fff" : "#777"}
        />
      </TouchableOpacity>

      {/* CURSOS */}
      <TouchableOpacity onPress={() => go("/(tabs)/cursos")} style={styles.item}>
        <MaterialCommunityIcons
          name={isActive("/cursos") ? "school" : "school-outline"}
          size={30}
          color={isActive("/cursos") ? "#fff" : "#777"}
        />
      </TouchableOpacity>

      {/* LOGO CENTRAL */}
      <TouchableOpacity
        onPress={() => go("/(tabs)/(home)/principal")}
        style={isActive("/(home)/principal") ? styles.logoWrapperOn : styles.logoWrapperOff}
      >
        <Image source={seekLogo} style={styles.logo} />
      </TouchableOpacity>

      {/* VAGAS */}
      <TouchableOpacity onPress={() => go("/(tabs)/vagas")} style={styles.item}>
        <MaterialIcons
          name={isActive("/vagas") ? "work" : "work-outline"}
          size={30}
          color={isActive("/vagas") ? "#fff" : "#777"}
        />
      </TouchableOpacity>

      {/* PERFIL */}
      <TouchableOpacity onPress={() => go("/(tabs)/perfil")} style={styles.item}>
        <MaterialIcons
          name={isActive("/perfil") ? "person" : "person-outline"}
          size={30}
          color={isActive("/perfil") ? "#fff" : "#777"}
        />
      </TouchableOpacity>

    </View>
  );
}


export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // esconde a tab nativa
        }}
      >
        <Tabs.Screen name="(home)/principal" />
        <Tabs.Screen name="(home)/tendencias" />
        <Tabs.Screen name="(home)/seguindo" />

        <Tabs.Screen name="cursos" />
        <Tabs.Screen name="vagas" />
        <Tabs.Screen name="perfil" />
      </Tabs>

      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom:0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#090909",
    flexDirection: "row",
    paddingTop:10,
    justifyContent: "space-around",
    alignItems: "flex-start",
  },

  item: {
    padding: 10,
  },
  logoWrapperOff: {
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  logoWrapperOn: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: "140%",
    height: "140%",
    borderRadius: 30,
    resizeMode: "contain",
  },
});
