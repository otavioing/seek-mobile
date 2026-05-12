// app/(tabs)/_layout.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// >> AJUSTE AQUI o caminho da sua logo <<
const seekLogo = require("../../assets/images/adaptive-icon.png");

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const current = "/" + segments.join("/");
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const isActive = (path: string) => current.includes(path);
  const go = (path: string) => router.push(path as any);
  const refreshHome = () => {
    const target = `/(tabs)/(home)/principal?refresh=${Date.now()}`;
    router.replace(target as any);
  };

  return (
    <View style={styles.wrapper}>
      {showCreateMenu ? (
        <Pressable style={styles.backdrop} onPress={() => setShowCreateMenu(false)}>
          <Pressable style={[styles.createMenu, { bottom: (insets.bottom || 10) + 76 }]}>
            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setShowCreateMenu(false);
                go("/postarProjeto");
              }}
            >
              <MaterialIcons name="brush" size={18} color="#fff" />
              <Text style={styles.createOptionText}>Postar um projeto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setShowCreateMenu(false);
                go("/postarCurso");
              }}
            >
              <MaterialCommunityIcons name="school-outline" size={18} color="#fff" />
              <Text style={styles.createOptionText}>Postar um curso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setShowCreateMenu(false);
                go("/postarVaga");
              }}
            >
              <MaterialIcons name="work-outline" size={18} color="#fff" />
              <Text style={styles.createOptionText}>Postar uma vaga</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      ) : null}

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
          onPress={() => setShowCreateMenu((prev) => !prev)}
          style={showCreateMenu ? styles.logoWrapperOn : styles.logoWrapperOff}
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
        <TouchableOpacity onPress={() => go("/configuracoes/menuUser")} style={styles.item}>
          <MaterialIcons
            name={isActive("/configuracoes/menuUser") ? "person" : "person-outline"}
            size={30}
            color={isActive("/configuracoes/menuUser") ? "#fff" : "#777"}
          />
        </TouchableOpacity>
      </View>
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
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  createMenu: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#111216",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 220,
    borderWidth: 1,
    borderColor: "#272B33",
  },
  createOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  createOptionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  tabbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#090909",
    flexDirection: "row",
    height: 70,
    paddingVertical: 8,
    alignItems: "center",
  },

  item: {
    padding: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },

  logoWrapperOff: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  logoWrapperOn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: "contain",
  },
});
