import { Comment, useComments } from '@/src/context/CommentsContext';
import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ImageStyle,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Post, usePosts } from '../../../src/context/PostsContext';
import { FeedTheme, getFeedTheme } from '../../../src/theme/appTheme';

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
};

interface AuthorAvatarProps {
  source: any;
  style?: StyleProp<ImageStyle>;
}

const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ source, style }) => (
  <Image source={source} style={[styles.avatar, style]} />
);

const ModalHeader = ({ onClose, theme }: { onClose: () => void; theme: FeedTheme }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color={theme.textPrimary} />
    <Text style={[styles.modalGoBackText, { color: theme.textPrimary }]}>Voltar</Text>
  </TouchableOpacity>
);

interface PostDetailModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  theme: FeedTheme;
  onPressAuthor?: (post: Post) => void;
  onPressCommentAuthor?: (comment: Comment) => void;
}

const PostDetailModal = ({ visible, onClose, post, theme, onPressAuthor, onPressCommentAuthor }: PostDetailModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<ScrollView>(null);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToUserName, setReplyToUserName] = useState('');

  const { commentsByPost, fetchComments, addComment, addReply } = useComments();

  const carregarLikes = async () => {
    if (!post?.id) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const resLike = await api.get(`/posts/verifica-like/${userId}/${post.id}`);
      setLiked(resLike.data === true);

      const resCount = await api.get(`/posts/likes/${post.id}`);
      setLikesCount(resCount.data[0]?.total_likes || 0);
    } catch (err) {
      console.log("Erro ao carregar likes:", err);
    }
  };

  useEffect(() => {
    setActiveIndex(0);
    if (pagerRef.current) pagerRef.current.scrollTo({ y: 0, animated: false });

    if (post?.id) {
      fetchComments(post.id);
      carregarLikes();
    }

    setCommentText('');
    setReplyToCommentId(null);
    setReplyToUserName('');
  }, [post]);

  if (!post) return null;

  const imageSize = Dimensions.get('window').width;
  const comments = commentsByPost[post.id] || [];

  const handleToggleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.post('/posts/like', {
        userId: Number(userId),
        postId: post.id
      });

      const { liked } = response.data;

      setLiked(liked);
      setLikesCount((prev) => liked ? prev + 1 : Math.max(0, prev - 1));

    } catch (err) {
      console.log("Erro ao dar like:", err);
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
              <Image
                source={comment.avatar}
                style={styles.commentAvatar}
              />
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
            <AuthorAvatar source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={[styles.modalUserName, { color: theme.textPrimary }]}>{post.author}</Text>
          </TouchableOpacity>

          {post.title && (
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{post.title}</Text>
          )}

          <ScrollView
            ref={pagerRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.y / imageSize);
              setActiveIndex(idx);
            }}
          >
            {post.images.map((img, idx) => {
              const source = typeof img === 'string' ? { uri: img } : img;

              return (
                <Image
                  key={idx}
                  source={source}
                  style={[styles.modalImage, { height: imageSize }]}
                />
              );
            })}
          </ScrollView>

          <View style={styles.modalContent}>
            {post.description && (
              <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>{post.description}</Text>
            )}

            <View style={[styles.likesContainer, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                style={styles.likesButton}
                onPress={handleToggleLike}
                activeOpacity={0.7}
              >
                <Icon
                  name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
                  size={22}
                  color={liked ? '#2563EB' : theme.textPrimary}
                />
                <Text style={[styles.likesText, { color: theme.textPrimary }, liked && { color: '#2563EB' }]}>
                  {likesCount} curtidas
                </Text>
              </TouchableOpacity>

              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {formatRelativeTime(post.postedAt)}
              </Text>
            </View>

            <Text style={[styles.commentsTitle, { color: theme.textPrimary }]}>Comentários</Text>

            {replyToCommentId && (
              <View style={[styles.replyContextRow, { borderColor: theme.inputBorder }]}>
                <Text style={[styles.replyContextText, { color: theme.textSecondary }]}>Respondendo {replyToUserName}</Text>
                <TouchableOpacity onPress={handleCancelReply}>
                  <Text style={styles.cancelReplyText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
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
              <Text style={[styles.commentText, styles.commentEmpty, { color: theme.textSecondary }]}>
                Nenhum comentário ainda.
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function HomeScreen() {
  const { posts, refreshPosts } = usePosts();
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isFocused = useIsFocused();

  const theme = getFeedTheme(darkMode);

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

  const openImageModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleOpenAuthorProfile = (post: Post) => {
    if (!post.userId) return;
    setIsModalVisible(false);
    router.push(`/usuario/${post.userId}` as any);
  };

  const handleOpenCommentAuthorProfile = (comment: Comment) => {
    if (!comment?.userId) return;
    setIsModalVisible(false);
    router.push(`/usuario/${comment.userId}` as any);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />

      <ScrollView
        style={[styles.gallery, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.galleryContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((post) => {
          const cover = typeof post.images[0] === 'string'
            ? { uri: post.images[0] }
            : post.images[0];

          return (
            <View key={post.id} style={[styles.cardContainer, { backgroundColor: theme.card }]}>
              {/* Title intentionally omitted here to match prototype; title is shown in the modal when the post is opened */}

              <TouchableOpacity onPress={() => openImageModal(post)}>
                <Image style={styles.galleryImage} source={cover} />
              </TouchableOpacity>

              <View style={styles.cardInfo}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardAuthor, { color: theme.textPrimary }]}>{post.author}</Text>
                  <Text style={[styles.cardFollowers, { color: theme.textMuted }]}>{post.followers}</Text>
                </View>

                <Text style={[styles.timeText, { color: theme.textMuted }]}>
                  {formatRelativeTime(post.postedAt)}
                </Text>

                <AuthorAvatar source={post.avatar} />
              </View>

              {post.description && (
                <Text
                  style={[styles.cardDescription, { color: theme.textSecondary }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {post.description}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <PostDetailModal
        visible={isModalVisible}
        onClose={closeImageModal}
        post={selectedPost}
        theme={theme}
        onPressAuthor={handleOpenAuthorProfile}
        onPressCommentAuthor={handleOpenCommentAuthorProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },
  divCategorias: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    paddingTop: 20,
    height: 60,
  },
  categorias: {
    color: "white",
    fontSize: 17,
    paddingLeft: 15,
  },
  carouselContainer: {
  },
  gallery: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 130,
    paddingHorizontal: 16,
  },
  galleryContent: {
    paddingBottom: 160,
  },
  galleryImage: {
    width: "100%",
    height: 300,
    resizeMode: 'cover',
  },
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    marginLeft: 12,
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
  cardDescription: {
    color: '#ddd',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalGoBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalGoBackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },
  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    marginRight: 12,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalImage: {
    width: '100%',
    height: Dimensions.get('window').width,
    resizeMode: 'cover',
    marginTop: 12,
  },
  modalContent: {
    padding: 20,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  likesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 12,
  },
  modalDescription: {
    color: '#eee',
    marginBottom: 12,
    lineHeight: 20,
  },
  likesText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  commentContainer: {
    backgroundColor: '#1a1a1a',
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#ddd',
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
  commentEmpty: {
    marginTop: 12,
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
  commentInputRow: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
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