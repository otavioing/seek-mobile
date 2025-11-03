import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const [isMainMenuVisible, setIsMainMenuVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Animações para o menu do usuário
  const userMenuOverlayOpacity = useRef(new Animated.Value(0)).current;
  const userMenuPosition = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  // Animações para o menu hambúrguer
  const mainMenuOverlayOpacity = useRef(new Animated.Value(0)).current;
  const mainMenuPosition = useRef(new Animated.Value(Dimensions.get('window').height)).current;


  useEffect(() => {
    // Lógica para animar o menu do usuário
    if (isUserMenuVisible) {
      Animated.parallel([
        Animated.timing(userMenuOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(userMenuPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Lógica para animar o menu hambúrguer
    if (isMainMenuVisible) {
      Animated.parallel([
        Animated.timing(mainMenuOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainMenuPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isUserMenuVisible, isMainMenuVisible]);

  const handleMainMenuPress = () => {
    setIsMainMenuVisible(true);
  };

  const handleCloseMainMenu = () => {
    Animated.parallel([
      Animated.timing(mainMenuOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(mainMenuPosition, {
        toValue: Dimensions.get('window').height,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMainMenuVisible(false);
    });
  };

  const handleUserMenuPress = () => {
    setIsUserMenuVisible(true);
  };

  const handleCloseUserMenu = () => {
    Animated.parallel([
      Animated.timing(userMenuOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(userMenuPosition, {
        toValue: Dimensions.get('window').height,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsUserMenuVisible(false);
    });
  };

  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.textoHeader}>Explorar</Text>
        <Text style={styles.textoHeader}>Tendências</Text>
        <Text style={styles.textoHeader}>Seguindo</Text>
        <TouchableOpacity>
        <Image style={styles.filtroHeader} source={require('@/assets/images/filtroHeader.png')} />
      </TouchableOpacity>
      </View>

      <View style={styles.divCategorias}>
        <Text style={styles.categorias}>Para você</Text>
        <Text style={styles.categorias}>Ruas</Text>
        <Text style={styles.categorias}>Modernismo</Text>
        <Text style={styles.categorias}>Paisagem</Text>
      </View>

      <ScrollView style={styles.gallery}>
        <Image
          style={styles.galleryImage}
          source={require('@/assets/images/imgTeste.png')}
        />
        <Image
          style={styles.galleryImage}
          source={require('@/assets/images/imgTeste2.png')}
        />
        <Image
          style={styles.galleryImage}
          source={require('@/assets/images/ImgTeste3.png')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },
  header: {
    width: "96%",
    height: 60,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#0f0f0f",
    marginTop: 40,
    marginLeft: "2%",
    borderRadius: 20,
  },
  textoHeader: {
    color: "white",
  },
  filtroHeader: {
    backgroundColor: "none",
  },
  divCategorias: {
    width: "85%",
    marginLeft: "7.5%",
    display: "flex",
    flexDirection: "row",
    gap: 20,
    paddingTop: 20,
    height: 60,
  },
  categorias: {
    color: "white",
    fontSize: 17,
  },
  gallery: {
    flex: 1,
    paddingHorizontal: 16,
  },
  galleryImage: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 20,
    elevation: 12,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mainMenuContainer: {
    backgroundColor: 'black',
    width: '80%',
    padding: 20,
    paddingTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginLeft: 10,
    marginBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 25,
  },
  closeButtonText: {
    color: '#eb5151ff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuLinks: {
    marginTop: 20,
  },
  menuText: {
    color: '#fff',
    fontSize: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  animatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  userMenuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  userMenuContainer: {
    backgroundColor: 'black',
    width: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginRight: 10,
    marginBottom: 40,
  },
  userMenuLinks: {
    width: '100%',
  },
  userMenuItem: {
    paddingVertical: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  userMenuText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    borderBottomWidth: 0,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    width: '100%',
  },
  iconText: {
    fontSize: 24,
    marginHorizontal: 10,
    color: 'white',
  },
});