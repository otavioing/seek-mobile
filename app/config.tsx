import { Link } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
   Animated,
  TouchableOpacity,
  View,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { createContext, useState, useContext } from "react";




export default function Config() {

  const color = "white";
  const size = 60;
  
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
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.header}>
          <Svg width={70} height={70} viewBox="0 0 80 80" fill="none">
            <Path
              d="M19.7735 55.6483C22.5691 53.5105 25.6935 51.825 29.1469 50.5916C32.6002 49.3583 36.218 48.7416 40.0002 48.7416C43.7824 48.7416 47.4002 49.3583 50.8535 50.5916C54.3069 51.825 57.4313 53.5105 60.2269 55.6483C62.1454 53.4009 63.6391 50.852 64.708 48.0016C65.7769 45.1513 66.3113 42.109 66.3113 38.875C66.3113 31.5846 63.7487 25.3768 58.6235 20.2516C53.4984 15.1265 47.2906 12.5639 40.0002 12.5639C32.7098 12.5639 26.5021 15.1265 21.3769 20.2516C16.2517 25.3768 13.6891 31.5846 13.6891 38.875C13.6891 42.109 14.2235 45.1513 15.2924 48.0016C16.3613 50.852 17.855 53.4009 19.7735 55.6483ZM40.0002 42.1639C36.7661 42.1639 34.0391 41.0539 31.8191 38.8339C29.5991 36.6139 28.4891 33.8868 28.4891 30.6527C28.4891 27.4187 29.5991 24.6916 31.8191 22.4716C34.0391 20.2516 36.7661 19.1416 40.0002 19.1416C43.2343 19.1416 45.9613 20.2516 48.1813 22.4716C50.4013 24.6916 51.5113 27.4187 51.5113 30.6527C51.5113 33.8868 50.4013 36.6139 48.1813 38.8339C45.9613 41.0539 43.2343 42.1639 40.0002 42.1639ZM40.0002 71.7638C35.4506 71.7638 31.175 70.9005 27.1735 69.1738C23.1721 67.4472 19.6913 65.1038 16.7313 62.1438C13.7713 59.1838 11.428 55.7031 9.70133 51.7016C7.97466 47.7001 7.11133 43.4246 7.11133 38.875C7.11133 34.3253 7.97466 30.0498 9.70133 26.0483C11.428 22.0468 13.7713 18.5661 16.7313 15.6061C19.6913 12.6461 23.1721 10.3027 27.1735 8.57608C31.175 6.84942 35.4506 5.98608 40.0002 5.98608C44.5498 5.98608 48.8254 6.84942 52.8269 8.57608C56.8284 10.3027 60.3091 12.6461 63.2691 15.6061C66.2291 18.5661 68.5724 22.0468 70.2991 26.0483C72.0258 30.0498 72.8891 34.3253 72.8891 38.875C72.8891 43.4246 72.0258 47.7001 70.2991 51.7016C68.5724 55.7031 66.2291 59.1838 63.2691 62.1438C60.3091 65.1038 56.8284 67.4472 52.8269 69.1738C48.8254 70.9005 44.5498 71.7638 40.0002 71.7638ZM40.0002 65.1861C42.9054 65.1861 45.6461 64.7613 48.2224 63.9116C50.7987 63.062 53.1558 61.8424 55.2935 60.2527C53.1558 58.6631 50.7987 57.4435 48.2224 56.5938C45.6461 55.7442 42.9054 55.3194 40.0002 55.3194C37.095 55.3194 34.3543 55.7442 31.778 56.5938C29.2017 57.4435 26.8447 58.6631 24.7069 60.2527C26.8447 61.8424 29.2017 63.062 31.778 63.9116C34.3543 64.7613 37.095 65.1861 40.0002 65.1861ZM40.0002 35.5861C41.4254 35.5861 42.6039 35.1201 43.5358 34.1883C44.4676 33.2564 44.9335 32.0779 44.9335 30.6527C44.9335 29.2276 44.4676 28.049 43.5358 27.1172C42.6039 26.1853 41.4254 25.7194 40.0002 25.7194C38.575 25.7194 37.3965 26.1853 36.4647 27.1172C35.5328 28.049 35.0669 29.2276 35.0669 30.6527C35.0669 32.0779 35.5328 33.2564 36.4647 34.1883C37.3965 35.1201 38.575 35.5861 40.0002 35.5861Z"
              fill={color}
            />
          </Svg>

          <View style={{ justifyContent: "flex-start" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 21, fontWeight: "700" }}>
              Nome de usuário
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 11 }}>ver perfil</Text>
          </View>

          <Svg
            width={(26 / 45) * size}
            height={size}
            viewBox="0 0 26 45"
            fill="none"
          >
            <Path
              d="M2.25 2.25L22.125 22.125L2.25 42"
              stroke={color}
              strokeWidth={4.5}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>


<View
  style={{
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
    marginTop: 25,
  }}
/>
      <Text style={{fontSize:28, color:"#FFFFFF", paddingHorizontal:20,paddingTop:10,}} >Configurações</Text>
      <TouchableOpacity style={styles.fbtContainer}>
        <Text style={styles.textoFiltro}>Privacidade</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer}>
        <Text style={styles.textoFiltro}>Notificações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer}>
        <Text style={styles.textoFiltro}>Inforrmações do Usuário</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer}>
        <Text style={styles.textoFiltro}>Email e Senha</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fbtContainer}>
      <Text style={styles.textoFiltro}>Acessibilidade</Text>
      </TouchableOpacity>
      <View style={styles.fbtContainer}>
      {/* Ícone de lua */}
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 12.79A9 9 0 0111.21 3 7 7 0 1012 21a9 9 0 009-8.21z"
          fill={darkMode ? "#888" : "#444"}
        />
      </Svg>

      {/* Botão */}
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

      {/* Ícone de sol */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap:30,
    paddingHorizontal:10,
  },
  fbtContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 25,
    paddingHorizontal:20,
    width: "100%",
  },
  textoFiltro: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
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
});
