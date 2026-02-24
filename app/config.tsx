import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

export default function Config() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const translateX = new Animated.Value(darkMode ? 2 : 26);

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: darkMode ? 26 : 2,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setDarkMode(!darkMode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Configurações</Text>

        <Link href="/privacidade" asChild>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={styles.itemText}>Privacidade</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.itemRow}>
          <Text style={styles.itemText}>Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemRow}>
          <Text style={styles.itemText}>Informações do Usuário</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemRow}>
          <Text style={styles.itemText}>Email e Senha</Text>
        </TouchableOpacity>

        {/* Acessibilidade + switch de modo escuro/claro */}
        <View style={[styles.itemRow, styles.accessibilityRow]}>
          <Text style={styles.itemText}>Acessibilidade</Text>

          <View style={styles.switchContainer}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 12.79A9 9 0 0111.21 3 7 7 0 1012 21a9 9 0 009-8.21z"
                fill={darkMode ? "#888" : "#444"}
              />
            </Svg>

            <TouchableOpacity onPress={toggleSwitch}>
              <View style={styles.switch}>
                <Animated.View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: darkMode ? "#3b82f6" : "#ddd",
                      transform: [{ translateX }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m0 13.9l1.41-1.41M17.54 6.46l1.41-1.41"
                stroke={darkMode ? "#888" : "#444"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        {/* Sair */}
        <TouchableOpacity style={styles.itemRow}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

        {/* Excluir conta */}
        <TouchableOpacity style={styles.itemRow}>
          <Text style={styles.deleteText}>Excluir conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90, // espaço para a barra inferior
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    marginRight: 4,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  itemText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  accessibilityRow: {
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 2,
    marginHorizontal: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  deleteText: {
    color: "#FF4B4B",
    fontSize: 18,
    fontWeight: "500",
  },
});

