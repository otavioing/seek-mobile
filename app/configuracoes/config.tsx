import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  const size = 48;
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const translateX = useRef(new Animated.Value(darkMode ? 44 : 2)).current;

  const theme = darkMode
    ? {
        background: "#121212",
        textPrimary: "#FFFFFF",
        textSecondary: "#B0B0B0",
        textDanger: "#FF4B4B",
        divider: "#FFFFFF",
        icon: "#FFFFFF",
        switchTrack: "#FFFFFF",
        switchThumb: "#3B82F6",
      }
    : {
        background: "#F2F2F2",
        textPrimary: "#111111",
        textSecondary: "#5C5C5C",
        textDanger: "#C62828",
        divider: "#BDBDBD",
        icon: "#111111",
        switchTrack: "#BDBDBD",
        switchThumb: "#111111",
      };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("tema");
        setDarkMode(savedTheme !== "claro");
      } catch (error) {
        console.log("Erro ao carregar tema:", error);
      } finally {
        setIsLoadingTheme(false);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: darkMode ? 44 : 2,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [darkMode]);

  const toggleSwitch = async () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    try {
      await AsyncStorage.setItem("tema", nextDarkMode ? "escuro" : "claro");
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Configurações</Text>

        <View style={[styles.divider, { borderBottomColor: theme.divider }]} />

        <TouchableOpacity
          style={styles.fbtContainer}
          onPress={() => router.push("/configuracoes/privacidade")}
        >
          <Svg width={size} height={size} viewBox="0 -960 960 960" fill={theme.icon}>
            <Path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
          </Svg>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Privacidade</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fbtContainer}
          onPress={() => router.push("/configuracoes/config_notificacoes")}
        >
          <Svg width={size} height={size} viewBox="0 -960 960 960" fill={theme.icon}>
            <Path d="M480-489Zm0 409q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM160-200v-80h80v-280q0-84 50.5-149T422-793q-10 22-15.5 46t-7.5 49q-35 21-57 57t-22 81v280h320v-122q20 3 40 3t40-3v122h80v80H160Zm480-280-12-60q-12-5-22.5-10.5T584-564l-58 18-40-68 46-40q-2-13-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-820l12-60h80l12 60q12 5 22.5 10.5T776-796l58-18 40 68-46 40q2 13 2 26t-2 26l46 40-40 68-58-18q-11 8-21.5 13.5T732-540l-12 60h-80Zm96.5-143.5Q760-647 760-680t-23.5-56.5Q713-760 680-760t-56.5 23.5Q600-713 600-680t23.5 56.5Q647-600 680-600t56.5-23.5Z" />
          </Svg>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fbtContainer}
          onPress={() => router.push("/configuracoes/informacoesuser")}
        >
          <Svg width={size} height={size} viewBox="0 -960 960 960" fill={theme.icon}>
            <Path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
          </Svg>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Informações do Usuário</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fbtContainer}
          onPress={() => router.push("/configuracoes/alteraremailsenha")}
        >
          <Svg width={size} height={size} viewBox="0 -960 960 960" fill={theme.icon}>
            <Path d="M762.5-257.5Q780-275 780-300t-17.5-42.5Q745-360 720-360t-42.5 17.5Q660-325 660-300t17.5 42.5Q695-240 720-240t42.5-17.5ZM776-134q26-14 43-39-23-14-48-20.5t-51-6.5q-26 0-51 6.5T621-173q17 25 43 39t56 14q30 0 56-14ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM490-80H240q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v52q-18-6-37.5-9t-42.5-3v-40H240v400h212q8 24 16 41.5T490-80Zm88.5-18.5Q520-157 520-240t58.5-141.5Q637-440 720-440t141.5 58.5Q920-323 920-240T861.5-98.5Q803-40 720-40T578.5-98.5ZM240-560v400-400Z" />
          </Svg>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Email e Senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fbtContainer} onPress={() => router.push('/configuracoes/acessibilidade')}>
          <Svg width={size} height={size} viewBox="0 0 58 58" fill="none">
            <Path
              d="M49.25 18.4165V20.2505H34.75V51.6665H32.917V37.1665H25.083V51.6665H23.25V20.2505H8.75V18.4165H49.25ZM29 6.3335C29.9281 6.3335 30.6851 6.64661 31.3525 7.31396C32.0199 7.98135 32.3329 8.73847 32.333 9.6665C32.333 10.5947 32.02 11.3526 31.3525 12.02C30.6851 12.6873 29.928 13.0005 29 13.0005C28.072 13.0005 27.3148 12.6873 26.6475 12.02C25.98 11.3526 25.667 10.5947 25.667 9.6665C25.6671 8.73847 25.9801 7.98135 26.6475 7.31396C27.3149 6.64661 28.0719 6.3335 29 6.3335Z"
              stroke={theme.icon}
              strokeWidth="3"
            />
          </Svg>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Acessibilidade</Text>
        </TouchableOpacity>

        {/* Switch alinhado perfeitamente com os itens acima */}
        <TouchableOpacity style={styles.fbtContainer} onPress={toggleSwitch} activeOpacity={0.7}>
          <View style={[styles.switch, { backgroundColor: theme.switchTrack }]}>
            <Animated.View
              style={[
                styles.circle,
                { backgroundColor: theme.switchThumb, transform: [{ translateX }] },
              ]}
            />
          </View>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>
            {darkMode ? "Modo Escuro" : "Modo Claro"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fbtContainer}>
          <Ionicons name="trash-outline" size={size} color={theme.textDanger} />
          <Text style={[styles.textoFiltro, { color: theme.textDanger }]}>Excluir conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    // fontWeight: "500",
  },
  content: {
    paddingBottom: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  divider: {
    width: "100%",
    borderBottomWidth: 2,
    marginTop: 20,
    marginBottom: 10,
  },
  fbtContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // Espaçamento de 10px entre o SVG e a escrita
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: "100%",
  },
  textoFiltro: {
    fontSize: 16,
    fontWeight: "500",
  },
  switch: {
    width: 95,
    height: 48,
    borderRadius: 100,
    justifyContent: "center",
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  circle: {
    width: 44, // Um pouco menor para não colar na borda do track
    height: 44,
    borderRadius: 100,
  },
});