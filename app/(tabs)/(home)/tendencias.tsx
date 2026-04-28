import { Comment, useComments } from '@/src/context/CommentsContext';
import { api } from '@/src/services/api';
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
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

interface Post {
  id: string;
  imageUrl: ImageSourcePropType;
  author: string;
  userId?: string;
  followers: string;
  likes: number;
  comments: Comment[];
  userImage: ImageSourcePropType;
  title?: string;
  description?: string;
}

type Theme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBg: string;
  inputText: string;
};

/* ============================================================
   VARIÁVEIS
============================================================ */

const { width } = Dimensions.get("window");

/* ============================================================
   MODAL
============================================================ */

const ModalHeader = ({ onClose, theme }: { onClose: () => void; theme: Theme }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color={theme.textPrimary} />
    <Text style={[styles.modalGoBackText, { color: theme.textPrimary }]}>Voltar</Text>
  </TouchableOpacity>
);

interface PostDetailModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  theme: Theme;
  onPressAuthor?: (post: Post) => void;
  onPressCommentAuthor?: (comment: Comment) => void;
}

const PostDetailModal = ({ visible, onClose, post, theme, onPressAuthor, onPressCommentAuthor }: PostDetailModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToUserName, setReplyToUserName] = useState('');
  const { commentsByPost, fetchComments, addComment, addReply } = useComments();

  useEffect(() => {
    if (!post?.id || !visible) return;

    const carregarLikes = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const resLike = await api.get(`/posts/verifica-like/${userId}/${post.id}`);
        setLiked(resLike.data === true);

        const resCount = await api.get(`/posts/likes/${post.id}`);
        setLikesCount(resCount.data[0]?.total_likes || 0);
      } catch (err) {
        console.log('Erro ao carregar likes:', err);
      }
    };

    fetchComments(post.id);
    carregarLikes();
    setCommentText('');
    setReplyToCommentId(null);
    setReplyToUserName('');
  }, [post, visible]);

  if (!post) return null;
  const comments = commentsByPost[post.id] || [];

  const handleToggleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.post('/posts/like', {
        userId: Number(userId),
        postId: post.id,
      });

      const isLiked = response.data?.liked === true;
      setLiked(isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.log('Erro ao dar like:', err);
    }
  };

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || !post?.id) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      if (replyToCommentId) {
        await addReply(post.id, replyToCommentId, userId, trimmed);
      } else {
        await addComment(post.id, userId, trimmed);
      }

      setCommentText('');
      setReplyToCommentId(null);
      setReplyToUserName('');
    } catch (err) {
      console.log('Erro ao comentar:', err);
    }
  };

  const handleStartReply = (comment: Comment) => {
    setReplyToCommentId(comment.id);
    setReplyToUserName(comment.user);
  };

  const handleCancelReply = () => {
    setReplyToCommentId(null);
    setReplyToUserName('');
  };

  const renderCommentItem = (comment: Comment, depth = 0): React.ReactNode => {
    const isReplyLevel = depth === 1;

    return (
      <View key={`${comment.id}-${depth}`} style={[styles.commentWrapper, isReplyLevel && styles.replyWrapper]}>
        <View style={[styles.commentContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.commentHeader}
            disabled={!onPressCommentAuthor || !comment.userId}
            onPress={() => onPressCommentAuthor?.(comment)}
          >
            {comment.avatar && (
              <Image source={comment.avatar} style={styles.commentAvatar} />
            )}
            <Text style={[styles.commentUser, { color: theme.textPrimary }]}>{comment.user}</Text>
          </TouchableOpacity>

          <Text style={[styles.commentText, { color: theme.textSecondary }]}>{comment.text}</Text>

          <View style={styles.commentActionsRow}>
            <TouchableOpacity onPress={() => handleStartReply(comment)}>
              <Text style={styles.replyButtonText}>Responder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => renderCommentItem(reply, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ScrollView>
          <ModalHeader onClose={onClose} theme={theme} />

          <TouchableOpacity
            style={styles.modalHeader}
            disabled={!onPressAuthor || !post.userId}
            onPress={() => onPressAuthor?.(post)}
          >
            <Image source={post.userImage} style={styles.authorLogo} />
            <Text style={[styles.modalUserName, { color: theme.textPrimary }]}>{post.author}</Text>
          </TouchableOpacity>

          {post.title ? <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{post.title}</Text> : null}
          <Image source={post.imageUrl} style={styles.modalImage} />

          <View style={styles.modalContent}>
            <View style={[styles.likesContainer, { borderBottomColor: theme.border }]}>
              <TouchableOpacity style={styles.likesButton} onPress={handleToggleLike} activeOpacity={0.7}>
                <Icon name={liked ? 'thumbs-up' : 'thumbs-up-outline'} size={22} color={liked ? '#2563EB' : theme.textPrimary} />
                <Text style={[styles.likesText, { color: theme.textPrimary }, liked && { color: '#2563EB' }]}>{likesCount} curtidas</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.commentsTitle, { color: theme.textPrimary }]}>Comentários</Text>

            {replyToCommentId && (
              <View style={[styles.replyContextRow, { borderColor: theme.border }]}>
                <Text style={[styles.replyContextText, { color: theme.textSecondary }]}>Respondendo {replyToUserName}</Text>
                <TouchableOpacity onPress={handleCancelReply}>
                  <Text style={styles.cancelReplyText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: theme.inputBg, color: theme.inputText }]}
                placeholder={replyToCommentId ? 'Escreva sua resposta' : 'Escreva um comentário'}
                placeholderTextColor={theme.textMuted}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.commentSendButton} onPress={handleAddComment}>
                <Text style={styles.commentSendText}>Enviar</Text>
              </TouchableOpacity>
            </View>

            {comments.length > 0 ? (
              comments.map((comment) => renderCommentItem(comment))
            ) : (
              <Text style={[styles.commentText, { color: theme.textSecondary }]}>Nenhum comentário ainda.</Text>
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
  theme,
  onPressAuthor,
}: {
  author: string;
  userImage: ImageSourcePropType;
  theme: Theme;
  onPressAuthor: () => void;
}) => (
  <View style={styles.authorInfo}>
    <Text style={[styles.authorName, { color: theme.textPrimary }]}>{author}</Text>
    <TouchableOpacity onPress={onPressAuthor} activeOpacity={0.7}>
      <Image source={userImage} style={styles.authorLogo} />
    </TouchableOpacity>
  </View>
);

const PostCard = ({ post, onPress, onPressAuthor, style, theme }: any) => (
  <View style={[styles.card, style, { backgroundColor: theme.card }]}>
    {/* Title intentionally omitted here to match prototype; title is shown in the modal when the post is opened */}
    <TouchableOpacity onPress={() => onPress(post)} activeOpacity={0.9}>
      <Image source={post.imageUrl} style={styles.cardImage} />
    </TouchableOpacity>

    <AuthorInfo author={post.author} userImage={post.userImage} theme={theme} onPressAuthor={() => onPressAuthor(post)} />

    {post.description ? (
      <Text
        style={[styles.cardDescription, { color: theme.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {post.description}
      </Text>
    ) : null}
  </View>
);

const SectionCarousel = ({ title, children, theme }: any) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {children}
    </ScrollView>
  </View>
);

/* ============================================================
   TELA PRINCIPAL
============================================================ */

const TendenciasScreen = () => {
  const router = useRouter();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [postsPorCategoria, setPostsPorCategoria] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme: Theme = darkMode
    ? {
        background: '#000000',
        card: '#1a1a1a',
        textPrimary: '#FFFFFF',
        textSecondary: '#DDDDDD',
        textMuted: '#666666',
        border: '#333333',
        inputBg: '#f0f0f0',
        inputText: '#000000',
      }
    : {
        background: '#E6E6E6',
        card: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#333333',
        textMuted: '#666666',
        border: '#CCCCCC',
        inputBg: '#FFFFFF',
        inputText: '#111111',
      };

  const inputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchTendencias();
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('tema');
        setDarkMode(savedTheme === 'escuro');
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };

    if (isFocused) {
      loadTheme();
    }
  }, [isFocused]);

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

          imageUrl: {
            uri: item.imagens?.[0] || 'https://via.placeholder.com/300'
          },

          author: item.user?.nome || 'Usuário',
          userId: item.user?.id ? String(item.user.id) : undefined,

          followers: "",

          likes: item.total_likes || 0,

          comments: [],

          title: item.titulo || '',
          description: item.legenda || '',

          userImage: item.user?.foto
            ? { uri: item.user.foto }
            : require("../../../assets/images/perfil/denji.jpg"),
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

  const handleOpenAuthorProfile = (post: Post) => {
    if (!post?.userId) {
      Alert.alert('Perfil indisponível', 'Este post não retornou o id do usuário na API.');
      return;
    }

    setIsModalVisible(false);
    router.push(`/usuario/${post.userId}` as any);
  };

  const handleOpenCommentAuthorProfile = (comment: Comment) => {
    if (!comment?.userId) return;
    setIsModalVisible(false);
    router.push(`/usuario/${comment.userId}` as any);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.screen, { backgroundColor: theme.background }]}>

          {/* 🔍 SEARCH */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: theme.inputBg }]}>
              <TextInput
                ref={inputRef}
                placeholder="Buscar..."
                placeholderTextColor={theme.textMuted}
                style={[styles.searchInput, { color: theme.inputText }]}
              />

              <TouchableOpacity onPress={() => inputRef.current?.focus()}>
                <MaterialIcons name="search" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
            {categorias.map((categoria) => (
              <SectionCarousel
                key={categoria.id_categoria}
                title={categoria.nome_categoria}
                theme={theme}
              >
                {postsPorCategoria[categoria.nome_categoria]?.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPress={handleOpenModal}
                    onPressAuthor={handleOpenAuthorProfile}
                    style={styles.largeCard}
                    theme={theme}
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
        theme={theme}
        onPressAuthor={handleOpenAuthorProfile}
        onPressCommentAuthor={handleOpenCommentAuthorProfile}
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

  cardDescription: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 14,
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

  likesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 8,
  },

  commentInputRow: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  commentSendButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  commentSendText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  commentContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentWrapper: {
    marginBottom: 4,
  },
  replyWrapper: {
    marginLeft: 18,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  commentActionsRow: {
    marginTop: 8,
  },
  replyButtonText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  repliesContainer: {
    marginTop: 2,
  },
  replyContextRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyContextText: {
    fontSize: 13,
  },
  cancelReplyText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default TendenciasScreen;
