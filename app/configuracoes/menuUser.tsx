// import Breadcrumb from "@/components/Breadcrumb";
import { api } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Path, Svg } from "react-native-svg";


export default function menuUser() {

  const size = 48;
  const router = useRouter();

  const [nome, setNome] = useState("Carregando...");
  const [foto, setFoto] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  const carregarTema = useCallback(async () => {
    try {
      const temaSalvo = await AsyncStorage.getItem("tema");
      const isDark = temaSalvo !== "claro";

      setDarkMode(isDark);

      if (!temaSalvo) {
        await AsyncStorage.setItem("tema", "escuro");
      }
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    }
  }, []);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) return;

        const response = await api.get(`/usuarios/foto-perfil/${userId}`);

        const data = response.data;

        setNome(data.nome);
        setFoto(data.foto);

      } catch (error) {
        console.log("Erro ao carregar usuário:", error);
      }
    };

    carregarUsuario();
    carregarTema();
  }, [carregarTema]);

  useFocusEffect(
    useCallback(() => {
      carregarTema();
    }, [carregarTema])
  );

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

  const theme = darkMode
    ? {
      background: "#121212",
      textPrimary: "#FFFFFF",
      textSecondary: "#B0B0B0",
      icon: "#FFFFFF",
      divider: "#FFFFFF",
    }
    : {
      background: "#F2F2F2",
      textPrimary: "#111111",
      textSecondary: "#5C5C5C",
      icon: "#111111",
      divider: "#BDBDBD",
    };

  const color = theme.icon;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={styles.topBar}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
            <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
          </TouchableOpacity>

          {/* <Breadcrumb
            items={[
              { label: "Perfil", href: "/(tabs)/perfil" },
              { label: "Menu" },
            ]}
            textColor={theme.textSecondary}
            containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
          /> */}
        </View>
      </View>

      <View style={styles.header}>
        <Link href="/(tabs)/perfil" asChild>
          <TouchableOpacity style={styles.headerRow}>
            {foto ? (
              <Image
                source={{ uri: foto }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                }}
              />
            ) : (
              <Svg width={64} height={64} viewBox="0 0 80 80">
                {/* fallback caso não tenha foto */}
              </Svg>
            )}

            <View style={{ justifyContent: "flex-start" }}>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: "700" }}>
                {nome}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 11 }}>ver perfil</Text>
            </View>

            <Svg
              width={18}
              height={36}
              viewBox="0 0 26 45"
              fill="none"
              style={styles.arrowRight}
            >
              <Path
                d="M2.25 2.25L22.125 22.125L2.25 42"
                stroke={color}
                strokeWidth={4.5}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        </Link>
      </View>


      <View
        style={{
          width: "100%",
          borderBottomWidth: 2,
          borderBottomColor: theme.divider,
          marginTop: 25,
        }}
      />

      <TouchableOpacity style={styles.fbtContainer} onPress={() => router.push('/configuracoes/notificacoes')}>
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path
            d="M10 47.5V42.5H15V25C15 21.5417 16.0417 18.4688 18.125 15.7812C20.2083 13.0938 22.9167 11.3333 26.25 10.5V8.75C26.25 7.70833 26.6146 6.82292 27.3438 6.09375C28.0729 5.36458 28.9583 5 30 5C31.0417 5 31.9271 5.36458 32.6562 6.09375C33.3854 6.82292 33.75 7.70833 33.75 8.75V10.5C37.0833 11.3333 39.7917 13.0938 41.875 15.7812C43.9583 18.4688 45 21.5417 45 25V42.5H50V47.5H10ZM30 55C28.625 55 27.4479 54.5104 26.4688 53.5312C25.4896 52.5521 25 51.375 25 50H35C35 51.375 34.5104 52.5521 33.5312 53.5312C32.5521 54.5104 31.375 55 30 55ZM20 42.5H40V25C40 22.25 39.0208 19.8958 37.0625 17.9375C35.1042 15.9792 32.75 15 30 15C27.25 15 24.8958 15.9792 22.9375 17.9375C20.9792 19.8958 20 22.25 20 25V42.5Z"
            fill={color}
          />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Notificação</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer} onPress={() => router.push('/configuracoes/mensagens')}>
        <Svg width={size} height={size} viewBox="0 -960 960 960" fill="#FFFFFF">
          <Path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" fill={color} />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Mensagens</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer} onPress={() => router.push('/configuracoes/atualizacoes')}>
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path
            d="M30 52.5C26.875 52.5 23.9479 51.9062 21.2188 50.7188C18.4896 49.5312 16.1146 47.9271 14.0938 45.9062C12.0729 43.8854 10.4688 41.5104 9.28125 38.7812C8.09375 36.0521 7.5 33.125 7.5 30C7.5 26.875 8.09375 23.9479 9.28125 21.2188C10.4688 18.4896 12.0729 16.1146 14.0938 14.0938C16.1146 12.0729 18.4896 10.4688 21.2188 9.28125C23.9479 8.09375 26.875 7.5 30 7.5C33.4167 7.5 36.6562 8.22917 39.7188 9.6875C42.7812 11.1458 45.375 13.2083 47.5 15.875V10H52.5V25H37.5V20H44.375C42.6667 17.6667 40.5625 15.8333 38.0625 14.5C35.5625 13.1667 32.875 12.5 30 12.5C25.125 12.5 20.9896 14.1979 17.5938 17.5938C14.1979 20.9896 12.5 25.125 12.5 30C12.5 34.875 14.1979 39.0104 17.5938 42.4062C20.9896 45.8021 25.125 47.5 30 47.5C34.375 47.5 38.1979 46.0833 41.4688 43.25C44.7396 40.4167 46.6667 36.8333 47.25 32.5H52.375C51.75 38.2083 49.3021 42.9688 45.0312 46.7812C40.7604 50.5938 35.75 52.5 30 52.5ZM37 40.5L27.5 31V17.5H32.5V29L40.5 37L37 40.5Z"
            fill={color}
          />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Atualizações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 60 60"
          fill="none"
        >
          <Path
            d="M35 55V47.3125L48.8125 33.5625C49.1875 33.1875 49.6042 32.9167 50.0625 32.75C50.5208 32.5833 50.9792 32.5 51.4375 32.5C51.9375 32.5 52.4167 32.5938 52.875 32.7812C53.3333 32.9688 53.75 33.25 54.125 33.625L56.4375 35.9375C56.7708 36.3125 57.0312 36.7292 57.2188 37.1875C57.4062 37.6458 57.5 38.1042 57.5 38.5625C57.5 39.0208 57.4167 39.4896 57.25 39.9688C57.0833 40.4479 56.8125 40.875 56.4375 41.25L42.6875 55H35ZM38.75 51.25H41.125L48.6875 43.625L47.5625 42.4375L46.375 41.3125L38.75 48.875V51.25ZM15 55C13.625 55 12.4479 54.5104 11.4688 53.5312C10.4896 52.5521 10 51.375 10 50V10C10 8.625 10.4896 7.44792 11.4688 6.46875C12.4479 5.48958 13.625 5 15 5H35L50 20V27.5H45V22.5H32.5V10H15V50H30V55H15ZM47.5625 42.4375L46.375 41.3125L48.6875 43.625L47.5625 42.4375Z"
            fill={color}
          />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Modificar Projetos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer}>
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path
            d="M15 53V48L17.5 45.5H10C8.625 45.5 7.44792 45.0104 6.46875 44.0312C5.48958 43.0521 5 41.875 5 40.5V13C5 11.625 5.48958 10.4479 6.46875 9.46875C7.44792 8.48958 8.625 8 10 8H30V13H10V40.5H50V33H55V40.5C55 41.875 54.5104 43.0521 53.5312 44.0312C52.5521 45.0104 51.375 45.5 50 45.5H42.5L45 48V53H15ZM37.5 38L25 25.5L28.5 22L35 28.4375V8H40V28.4375L46.5 22L50 25.5L37.5 38Z"
            fill={color}
          />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Modificar Cursos</Text>
      </TouchableOpacity>
      <Link href="/configuracoes/config" asChild>
        <TouchableOpacity style={styles.fbtContainer}>
          <Svg
            width={size}
            height={size}
            viewBox="0 0 60 60"
            fill="none"
          >
            <Path
              d="M23.125 55L22.125 47C21.5833 46.7917 21.0729 46.5417 20.5938 46.25C20.1146 45.9583 19.6458 45.6458 19.1875 45.3125L11.75 48.4375L4.875 36.5625L11.3125 31.6875C11.2708 31.3958 11.25 31.1146 11.25 30.8438V29.1562C11.25 28.8854 11.2708 28.6042 11.3125 28.3125L4.875 23.4375L11.75 11.5625L19.1875 14.6875C19.6458 14.3542 20.125 14.0417 20.625 13.75C21.125 13.4583 21.625 13.2083 22.125 13L23.125 5H36.875L37.875 13C38.4167 13.2083 38.9271 13.4583 39.4062 13.75C39.8854 14.0417 40.3542 14.3542 40.8125 14.6875L48.25 11.5625L55.125 23.4375L48.6875 28.3125C48.7292 28.6042 48.75 28.8854 48.75 29.1562V30.8438C48.75 31.1146 48.7083 31.3958 48.625 31.6875L55.0625 36.5625L48.1875 48.4375L40.8125 45.3125C40.3542 45.6458 39.875 45.9583 39.375 46.25C38.875 46.5417 38.375 46.7917 37.875 47L36.875 55H23.125ZM27.5 50H32.4375L33.3125 43.375C34.6042 43.0417 35.8021 42.5521 36.9062 41.9062C38.0104 41.2604 39.0208 40.4792 39.9375 39.5625L46.125 42.125L48.5625 37.875L43.1875 33.8125C43.3958 33.2292 43.5417 32.6146 43.625 31.9688C43.7083 31.3229 43.75 30.6667 43.75 30C43.75 29.3333 43.7083 28.6771 43.625 28.0312C43.5417 27.3854 43.3958 26.7708 43.1875 26.1875L48.5625 22.125L46.125 17.875L39.9375 20.5C39.0208 19.5417 38.0104 18.7396 36.9062 18.0938C35.8021 17.4479 34.6042 16.9583 33.3125 16.625L32.5 10H27.5625L26.6875 16.625C25.3958 16.9583 24.1979 17.4479 23.0938 18.0938C21.9896 18.7396 20.9792 19.5208 20.0625 20.4375L13.875 17.875L11.4375 22.125L16.8125 26.125C16.6042 26.75 16.4583 27.375 16.375 28C16.2917 28.625 16.25 29.2917 16.25 30C16.25 30.6667 16.2917 31.3125 16.375 31.9375C16.4583 32.5625 16.6042 33.1875 16.8125 33.8125L11.4375 37.875L13.875 42.125L20.0625 39.5C20.9792 40.4583 21.9896 41.2604 23.0938 41.9062C24.1979 42.5521 25.3958 43.0417 26.6875 43.375L27.5 50ZM30.125 38.75C32.5417 38.75 34.6042 37.8958 36.3125 36.1875C38.0208 34.4792 38.875 32.4167 38.875 30C38.875 27.5833 38.0208 25.5208 36.3125 23.8125C34.6042 22.1042 32.5417 21.25 30.125 21.25C27.6667 21.25 25.5938 22.1042 23.9062 23.8125C22.2188 25.5208 21.375 27.5833 21.375 30C21.375 32.4167 22.2188 34.4792 23.9062 36.1875C25.5938 37.8958 27.6667 38.75 30.125 38.75Z"
              fill={color}
            />
          </Svg>
          <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Configurações</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity style={styles.fbtContainer}>
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path
            d="M17.2083 41.7917H22.125V29.5H17.2083V41.7917ZM36.875 41.7917H41.7917V17.2083H36.875V41.7917ZM27.0417 41.7917H31.9583V34.4167H27.0417V41.7917ZM27.0417 29.5H31.9583V24.5833H27.0417V29.5ZM12.2917 51.625C10.9396 51.625 9.78212 51.1436 8.81927 50.1807C7.85642 49.2179 7.375 48.0604 7.375 46.7083V12.2917C7.375 10.9396 7.85642 9.78212 8.81927 8.81927C9.78212 7.85642 10.9396 7.375 12.2917 7.375H46.7083C48.0604 7.375 49.2179 7.85642 50.1807 8.81927C51.1436 9.78212 51.625 10.9396 51.625 12.2917V46.7083C51.625 48.0604 51.1436 49.2179 50.1807 50.1807C49.2179 51.1436 48.0604 51.625 46.7083 51.625H12.2917ZM12.2917 46.7083H46.7083V12.2917H12.2917V46.7083Z"
            fill={color}
          />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Analytics</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer} onPress={handleLogout}>
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path
            d="M12 52C10.625 52 9.44792 51.5104 8.46875 50.5312C7.48958 49.5521 7 48.375 7 47V12C7 10.625 7.48958 9.44792 8.46875 8.46875C9.44792 7.48958 10.625 7 12 7H29.5V12H12V47H29.5V52H12ZM39.5 42L36.0625 38.375L42.4375 32H22V27H42.4375L36.0625 20.625L39.5 17L52 29.5L39.5 42Z"
            fill={color}
          />
        </Svg>
        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Sair</Text>
      </TouchableOpacity>
    </View>
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backIcon: {
    marginRight: 0,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    // fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 14,
    width: "100%",
  },
  fbtContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 18,
    paddingHorizontal: 16,
    width: "100%",
  },
  textoFiltro: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  arrowRight: {
    marginLeft: "auto",
  },
});
