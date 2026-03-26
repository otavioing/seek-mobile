import { api } from '@/src/services/api';
import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    Keyboard,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

/* ============================================================
   TYPES
============================================================ */

interface Comment {
  id: string;
  user: string;
  text: string;
}

interface Post {
  id: string;
  imageUrl: ImageSourcePropType;
  author: string;
  followers: string;
  likes: number;
  comments: Comment[];
  userImage: ImageSourcePropType; // 👈 NOVO
  title?: string;
}

/* ============================================================
   VARIÁVEIS
============================================================ */

const denjiAvatar = require("../../../assets/images/perfil/denji.jpg");
const { width } = Dimensions.get("window");

/* ============================================================
   MODAL
============================================================ */

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color="white" />
    <Text style={styles.modalGoBackText}>Voltar</Text>
  </TouchableOpacity>
);

const PostDetailModal = ({ visible, onClose, post }: any) => {
  if (!post) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <ModalHeader onClose={onClose} />

          <View style={styles.modalHeader}>
            <Image source={post.userImage} style={styles.authorLogo} />
            <Text style={styles.modalUserName}>{post.author}</Text>
          </View>

          {post.title ? <Text style={styles.modalTitle}>{post.title}</Text> : null}
          <Image source={post.imageUrl} style={styles.modalImage} />

          <View style={styles.modalContent}>
            <View style={styles.likesContainer}>
              <Icon name="thumbs-up-outline" size={22} color="#fff" />
              <Text style={styles.likesText}>{post.likes} curtidas</Text>
            </View>

            <Text style={styles.commentsTitle}>Comentários</Text>

            {post.comments.length > 0 ? (
              post.comments.map((c: any) => (
                <View key={c.id} style={styles.commentContainer}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.commentText}>Nenhum comentário ainda.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

/* ============================================================
   COMPONENTES
============================================================ */

const AuthorInfo = ({
  author,
  userImage,
}: {
  author: string;
  userImage: ImageSourcePropType;
}) => (
  <View style={styles.authorInfo}>
    <Text style={styles.authorName}>{author}</Text>
    <Image source={userImage} style={styles.authorLogo} />
  </View>
);

const PostCard = ({ post, onPress, style }: any) => (
  <TouchableOpacity onPress={() => onPress(post)}>
    <View style={[styles.card, style]}>
      {post.title ? <Text style={styles.cardTitle}>{post.title}</Text> : null}
      <Image source={post.imageUrl} style={styles.cardImage} />
      <AuthorInfo author={post.author} userImage={post.userImage} />
    </View>
  </TouchableOpacity>
);

const SectionCarousel = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {children}
    </ScrollView>
  </View>
);

/* ============================================================
   TELA PRINCIPAL
============================================================ */

const TendenciasScreen = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [postsPorCategoria, setPostsPorCategoria] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const inputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchTendencias();
  }, []);

  const fetchTendencias = async () => {
    try {
      const resCategorias = await api.get("/tendencias");
      setCategorias(resCategorias.data);

      const promises = resCategorias.data.map((cat: any) =>
        api.get(`/tendencias/${cat.id_categoria}`)
      );

      const responses = await Promise.all(promises);

      const postsTemp: any = {};

      responses.forEach((res, index) => {
        const categoria = resCategorias.data[index];

        postsTemp[categoria.nome_categoria] = res.data.map((item: any) => ({
          id: item.id.toString(),
          imageUrl: { uri: item.imagem },
          author: item.nome_usuario,
          followers: "",
          likes: item.total_likes,
          comments: [],
          title: item.titulo || '',
          userImage: item.foto_perfil
            ? { uri: item.foto_perfil }
            : require("../../../assets/images/perfil/denji.jpg"), // fallback
        }));
      });

      setPostsPorCategoria(postsTemp);
    } catch (error) {
      console.error("Erro ao buscar tendências:", error);
    }
  };

  const handleOpenModal = (post: any) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  useEffect(() => {
    const shouldFocus = params?.focusSearch;
    const focusFlag = Array.isArray(shouldFocus) ? shouldFocus[0] : shouldFocus;

    if (isFocused && focusFlag) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [params, isFocused]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screen}>

          {/* 🔍 SEARCH */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <TextInput
                ref={inputRef}
                placeholder="Buscar..."
                placeholderTextColor="#666"
                style={styles.searchInput}
              />

              <TouchableOpacity onPress={() => inputRef.current?.focus()}>
                <MaterialIcons name="search" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
            {categorias.map((categoria) => (
              <SectionCarousel
                key={categoria.id_categoria}
                title={categoria.nome_categoria}
              >
                {postsPorCategoria[categoria.nome_categoria]?.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPress={handleOpenModal}
                    style={styles.largeCard}
                  />
                ))}
              </SectionCarousel>
            ))}
          </ScrollView>

        </View>
      </TouchableWithoutFeedback>

      <PostDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        post={selectedPost}
      />
    </SafeAreaView>
  );
};


/* ============================================================
   ESTILOS
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* SEARCH BAR */
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },

  searchBox: {
    width: "100%",
    height: 45,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    marginRight: 10,
  },

  /* LISTA / CARDS */
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
    marginBottom: 16,
  },

  carouselContainer: {
    paddingLeft: 16,
  },

  card: {
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 8,
  },

  largeCard: {
    width: width * 0.7,
  },

  smallCard: {
    width: width * 0.45,
  },

  cardImage: {
    width: "100%",
    height: 250,
  },

  authorInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },

  authorName: {
    color: "#fff",
    fontWeight: "bold",
  },

  authorFollowers: {
    color: "#888",
    fontSize: 12,
  },

  authorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#555",
    borderWidth: 2,
    borderColor: "#fff",
  },

  /* MODAL */
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  modalGoBack: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  modalGoBackText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  modalUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },

  modalImage: {
    width: "100%",
    height: width,
    resizeMode: "cover",
    marginTop: 12,
  },

  modalContent: {
    padding: 20,
  },

  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  likesText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },

  commentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },

  commentContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  commentUser: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },

  commentText: {
    fontSize: 14,
    color: "#ddd",
  },
});

export default TendenciasScreen;
