// app/(tabs)/_layout.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// >> AJUSTE AQUI o caminho da sua logo <<
const seekLogo = require("../../assets/images/adaptive-icon.png");

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const current = "/" + segments.join("/");

  const isActive = (path: string) => current.includes(path);
  const go = (path: string) => router.push(path as any);
  const refreshHome = () => {
    const target = `/(tabs)/(home)/principal?refresh=${Date.now()}`;
    router.replace(target as any);
  };

  return (
    <View style={[styles.tabbar, { paddingBottom: insets.bottom || 10 }]}>
      
      {/* HOME / EXPLORAR */}
      <TouchableOpacity 
        onPress={refreshHome} 
        style={styles.item}
      >
        <MaterialIcons
          name={isActive("/(home)/principal") ? "home" : "home"}
          size={30}
          color={isActive("/(home)/principal") ? "#fff" : "#777"}
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
        onPress={() => go("/upload")}
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

      {/* PERFIL / CONFIGURAÇÕES */}
      <TouchableOpacity onPress={() => go("/menuUser")} style={styles.item}>
        <MaterialIcons
          name={isActive("/menuUser") ? "person" : "person-outline"}
          size={30}
          color={isActive("/menuUser") ? "#fff" : "#777"}
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#090909",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
