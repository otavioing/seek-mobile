import Breadcrumb from '@/components/Breadcrumb';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
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
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const translateX = useRef(new Animated.Value(2)).current;

  const theme = darkMode
    ? {
        background: "#000000",
        textPrimary: "#FFFFFF",
        textDanger: "#FF4B4B",
        arrow: "#7A7A7A",
        iconMuted: "#888888",
        switchTrack: "#FFFFFF",
        switchThumb: "#3B82F6",
        loading: "#7A7A7A",
      }
    : {
        background: "#D9D9D9",
        textPrimary: "#111111",
        textDanger: "#C62828",
        arrow: "#4F4F4F",
        iconMuted: "#3F3F3F",
        switchTrack: "#BDBDBD",
        switchThumb: "#111111",
        loading: "#4F4F4F",
      };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('tema');
        setDarkMode(savedTheme === 'escuro');
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      } finally {
        setIsLoadingTheme(false);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    translateX.setValue(darkMode ? 22 : 2);
  }, [darkMode, translateX]);

  const toggleSwitch = async () => {
    const nextDarkMode = !darkMode;

    Animated.timing(translateX, {
      toValue: nextDarkMode ? 22 : 2,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setDarkMode(nextDarkMode);

    try {
      await AsyncStorage.setItem('tema', nextDarkMode ? 'escuro' : 'claro');
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');

      router.replace('/login');

    } catch (error) {
      console.log('Erro', 'Erro ao sair da conta');
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
            <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
          </TouchableOpacity>

          <Breadcrumb
            items={[
              { label: 'Menu', href: '/configuracoes/menuUser' },
              { label: 'Configurações' },
            ]}
            textColor={theme.textPrimary}
            separatorColor={theme.arrow}
            containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Configurações</Text>

        <Link href="/configuracoes/privacidade" asChild>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={[styles.itemText, { color: theme.textPrimary }]}>Privacidade</Text>
            <Text style={[styles.arrowText, { color: theme.arrow }]}>➔</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => router.push('/configuracoes/config_notificacoes')}
        >
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>Notificações</Text>
          <Text style={[styles.arrowText, { color: theme.arrow }]}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemRow}
          onPress={() => router.push('/configuracoes/informacoesuser')}
        >
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>Informações do Usuário</Text>
          <Text style={[styles.arrowText, { color: theme.arrow }]}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemRow}
          onPress={() => router.push('/configuracoes/alteraremailsenha')}
        >
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>Email e Senha</Text>
          <Text style={[styles.arrowText, { color: theme.arrow }]}>➔</Text>
        </TouchableOpacity>

        {/* Acessibilidade + switch de modo escuro/claro */}
        <View style={[styles.itemRow, styles.accessibilityRow]}>
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>Acessibilidade</Text>

          <View style={styles.switchContainer}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 12.79A9 9 0 0111.21 3 7 7 0 1012 21a9 9 0 009-8.21z"
                fill={theme.iconMuted}
              />
            </Svg>

            <TouchableOpacity onPress={toggleSwitch}>
              <View style={[styles.switch, { backgroundColor: theme.switchTrack }]}> 
                <Animated.View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: theme.switchThumb,
                      transform: [{ translateX }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m0 13.9l1.41-1.41M17.54 6.46l1.41-1.41"
                stroke={theme.iconMuted}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        {isLoadingTheme && (
          <Text style={[styles.themeLoadingText, { color: theme.loading }]}>Carregando tema...</Text>
        )}

        {/* Sair */}
        <TouchableOpacity onPress={handleLogout} style={styles.itemRow}>
          <Text style={[styles.logoutText, { color: theme.textPrimary }]}>Sair</Text>
          <Text style={[styles.arrowText, { color: theme.arrow }]}>➔</Text>
        </TouchableOpacity>

        {/* Excluir conta */}
        <TouchableOpacity style={styles.itemRow}>
          <Text style={[styles.deleteText, { color: theme.textDanger }]}>Excluir conta</Text>
          <Text style={[styles.arrowText, { color: theme.arrow }]}>➔</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backIcon: {
    marginRight: 0,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  arrowText: {
    fontSize: 16,
    marginLeft: "auto",
  },
  accessibilityRow: {
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switch: {
    width: 44,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    paddingHorizontal: 2,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "500",
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "500",
  },
  themeLoadingText: {
    fontSize: 13,
    marginBottom: 10,
  },
});

