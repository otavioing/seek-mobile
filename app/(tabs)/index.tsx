import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

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

      {/* MODAL DO MENU LATERAL (HAMBÚRGUER) */}
      <Modal
        transparent={true}
        visible={isMainMenuVisible}
        onRequestClose={handleCloseMainMenu}
      >
        <Animated.View style={[styles.animatedOverlay, { opacity: mainMenuOverlayOpacity }]}>
          <TouchableOpacity style={styles.menuOverlay} onPress={handleCloseMainMenu} activeOpacity={1}>
            <Animated.View style={[styles.mainMenuContainer, { transform: [{ translateY: mainMenuPosition }] }]}>
              <TouchableOpacity onPress={handleCloseMainMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <View style={styles.menuLinks}>
                <Link href="/" onPress={handleCloseMainMenu} style={styles.menuText}>Explorar</Link>
                <Link href="/" onPress={handleCloseMainMenu} style={styles.menuText}>Cursos</Link>
                <Link href="/" onPress={handleCloseMainMenu} style={styles.menuText}>Vagas</Link>
                <Link href="/" onPress={handleCloseMainMenu} style={styles.menuText}>Sobre Nós</Link>
                <Link href="/" onPress={handleCloseMainMenu} style={styles.menuText}>Ajuda</Link>
                <Link href="/" onPress={handleCloseMainMenu} style={styles.menuText}>Atualizações</Link>
                <Link href="/" onPress={handleCloseUserMenu} style={styles.menuText}>Configurações</Link>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* MODAL DO MENU DO USUÁRIO (PARTE INFERIOR DIREITA) */}
      <Modal
        transparent={true}
        visible={isUserMenuVisible}
        onRequestClose={handleCloseUserMenu}
      >
        <Animated.View style={[styles.animatedOverlay, { opacity: userMenuOverlayOpacity }]}>
          <TouchableOpacity style={styles.userMenuOverlay} onPress={handleCloseUserMenu} activeOpacity={1}>
            <Animated.View style={[styles.userMenuContainer, { transform: [{ translateY: userMenuPosition }] }]}>
              <View style={styles.userMenuLinks}>
                <Link href="/" onPress={handleCloseUserMenu} style={styles.userMenuItem}>
                  <Text style={styles.userMenuText}>Meu Perfil</Text>
                </Link>
                <Link href="/" onPress={handleCloseUserMenu} style={styles.userMenuItem}>
                  <Text style={styles.userMenuText}>Configurações</Text>
                </Link>
              </View>
              
              <View style={styles.darkModeToggle}>
                <Text style={styles.iconText}>🌙</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#f4f3f4" }}
                  thumbColor={isDarkMode ? "#000" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isDarkMode}
                />
                <Text style={styles.iconText}>☀️</Text>
              </View>

              <Link href="/" onPress={handleCloseUserMenu} style={styles.userMenuItem}>
                <Text style={[styles.userMenuText, styles.loginText]}>Login</Text>
              </Link>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMainMenuPress}>
          <Image style={styles.menuBurger} source={require('@/assets/images/menuBurger.png')} />
        </TouchableOpacity>
        <Image style={styles.logo} source={require('@/assets/images/logoSeekBranca.png')} />
        <TouchableOpacity onPress={handleUserMenuPress}>
          <Image style={styles.menuBurger} source={require('@/assets/images/logoUser.png')} />
        </TouchableOpacity>
      </View>

      {/* RESTANTE DO CÓDIGO DA TELA */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pesquisar"
        />
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchText}><Image style={styles.lupaPesquisa} source={require('@/assets/images/lupaSearch.png')} /></Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.customizeBtn}>
        <Text style={styles.customizeText}><Image style={styles.personalizarGaleriaIcon} source={require('@/assets/images/editarIcon.png')} /> Personalizar a Galeria</Text>
      </TouchableOpacity>

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
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#000",
  },
  menuBurger: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: "contain",
  },
  searchContainer: {
    flexDirection: "row",
    margin: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
  },
  searchBtn: {
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  searchText: {
    fontSize: 16,
  },
  lupaPesquisa: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  customizeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  personalizarGaleriaIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  customizeText: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 14,
    color: "#333",
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