import React, { useEffect, useRef, useState } from "react";

// 1. Modal e StatusBar foram importados
import {
  Animated, Dimensions, Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet, Text, TouchableOpacity, View,
  ViewStyle
} from "react-native";

interface PostData {
  id: string;
  author: string;
  followers: string;
  imageUrl: ImageSourcePropType;
}

// 2. Criei dados fictícios para as postagens
const posts = [
  {
    id: '1',
    author: 'Nome autor',
    followers: '10000 seguindo',
    imageUrl: require('@/assets/images/imgTeste.png'),
  },
  {
    id: '2',
    author: 'Outro Artista',
    followers: '2345 seguindo',
    imageUrl: require('@/assets/images/imgTeste2.png'),
  },
  {
    id: '3',
    author: 'Paisagens Urbanas',
    followers: '7890 seguindo',
    imageUrl: require('@/assets/images/ImgTeste3.png'),
  },
];

interface AuthorAvatarProps {
  style?: StyleProp<ViewStyle>; // 'style' é opcional (?) e do tipo ViewStyle
}

// 3. Simula a "foto" (logo) do autor com um círculo cinza
const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ style }) => (
  <View style={[styles.avatar, style]} />
);

export default function HomeScreen() {
  const [isMainMenuVisible, setIsMainMenuVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 4. Estados para o Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  // --- Suas animações e estados originais ---
  const userMenuOverlayOpacity = useRef(new Animated.Value(0)).current;
  const userMenuPosition = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const mainMenuOverlayOpacity = useRef(new Animated.Value(0)).current;
  const mainMenuPosition = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // --- Sua lógica de useEffect (INTACTA) ---
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

  // --- Suas funções de menu (INTACTAS) ---
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

  // 5. Funções para controlar o Modal (NOVAS)
  const openImageModal = (post: PostData) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* CATEGORIAS (Seu código original) */}
      <View style={styles.divCategorias}>
        <Text style={styles.categorias}>Para você</Text>
        <Text style={styles.categorias}>Ruas</Text>
        <Text style={styles.categorias}>Modernismo</Text>
        <Text style={styles.categorias}>Paisagem</Text>
      </View>

      {/* 6. GALERIA ATUALIZADA */}
      <ScrollView style={styles.gallery}>
        {posts.map((post) => (
          // O card agora contém a imagem e as informações
          <View key={post.id} style={styles.cardContainer}>
            <TouchableOpacity onPress={() => openImageModal(post)}>
              <Image
                style={styles.galleryImage} // Este estilo foi alterado
                source={post.imageUrl}
              />
            </TouchableOpacity>
            
            {/* Informações do autor (logo + nome) abaixo da imagem */}
            <View style={styles.cardInfo}>
              <AuthorAvatar />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardAuthor}>{post.author}</Text>
                <Text style={styles.cardFollowers}>{post.followers}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 7. MODAL (adicionado) */}
      {selectedPost && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeImageModal}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            {/* Botão 'X' */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeImageModal}>
              <Text style={styles.modalCloseButtonText}>X</Text>
            </TouchableOpacity>

            {/* O card branco (Não fecha ao clicar) */}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContainer}
            >
              <Image
                source={selectedPost.imageUrl}
                style={styles.modalImage} // Mostra a imagem completa
              />
              {/* Informações do autor no modal */}
              <View style={styles.modalInfoBox}>
                <AuthorAvatar style={styles.modalAvatar} />
                <View style={styles.modalTextContainer}>
                  <Text style={styles.modalAuthor}>{selectedPost.author}</Text>
                  <Text style={styles.modalFollowers}>{selectedPost.followers}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Seus menus animados originais (não mexi) */}
    </View>
  );
}

// 8. ESTILOS (Atualizados e Adicionados)
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

  // --- ESTILOS MODIFICADOS ---
  galleryImage: {
    width: "100%",
    height: 300,           // Altura fixa para "esconder" a imagem
    resizeMode: 'cover',   // Garante que a imagem cubra a área, cortando o excesso
    // borderRadius removido daqui, pois o cardContainer vai cuidar disso
  },

  // --- NOVOS ESTILOS PARA O CARD ---
  cardContainer: {
    backgroundColor: '#1a1a1a', // Um fundo ligeiramente mais claro para o card
    borderRadius: 20,
    overflow: 'hidden',      // Corta a imagem para caber no raio da borda
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: { // Simulação da "foto" (logo)
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardAuthor: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardFollowers: {
    color: '#888',
    fontSize: 12,
  },

  // --- NOVOS ESTILOS PARA O MODAL ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { // O card branco
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalImage: { // A imagem completa
    width: '100%',
    height: 400, // Altura maior para ver a imagem
    resizeMode: 'contain', // Mostra a imagem completa
    backgroundColor: '#111', // Fundo escuro caso a imagem não preencha
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalAvatar: { // Logo no modal
    backgroundColor: '#ccc', // Cor mais clara para o fundo branco
  },
  modalTextContainer: {
    flex: 1,
  },
  modalAuthor: { // Texto preto no card branco
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalFollowers: {
    color: '#555',
    fontSize: 12,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50, // Ajustado para ser mais acessível
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // --- SEUS ESTILOS DE MENU (Originais) ---
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