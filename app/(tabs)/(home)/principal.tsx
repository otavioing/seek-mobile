import { useComments } from '@/src/context/CommentsContext';
import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color="white" />
    <Text style={styles.modalGoBackText}>Voltar</Text>
  </TouchableOpacity>
);

interface PostDetailModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
}

const PostDetailModal = ({ visible, onClose, post }: PostDetailModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<ScrollView>(null);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { commentsByPost, fetchComments, addComment } = useComments();

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

      await addComment(post.id, userId, trimmed);
      setCommentText('');
    } catch (err) {
      console.log('Erro ao comentar:', err);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <ModalHeader onClose={onClose} />

          <View style={styles.modalHeader}>
            <AuthorAvatar source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={styles.modalUserName}>{post.author}</Text>
          </View>

          {post.title && (
            <Text style={styles.modalTitle}>{post.title}</Text>
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
              <Text style={styles.modalDescription}>{post.description}</Text>
            )}

            <View style={styles.likesContainer}>
              <TouchableOpacity
                style={styles.likesButton}
                onPress={handleToggleLike}
                activeOpacity={0.7}
              >
                <Icon
                  name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
                  size={22}
                  color={liked ? '#2563EB' : '#fff'}
                />
                <Text style={[styles.likesText, liked && { color: '#2563EB' }]}>
                  {likesCount} curtidas
                </Text>
              </TouchableOpacity>

              <Text style={styles.timeText}>
                {formatRelativeTime(post.postedAt)}
              </Text>
            </View>

            <Text style={styles.commentsTitle}>Comentários</Text>

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escreva um comentário"
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.commentSendButton} onPress={handleAddComment}>
                <Text style={styles.commentSendText}>Enviar</Text>
              </TouchableOpacity>
            </View>

            {comments.length > 0 ? (
              comments.map(comment => (
                <View key={comment.id} style={styles.commentContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {comment.avatar && (
                      <Image
                        source={comment.avatar}
                        style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
                      />
                    )}
                    <Text style={styles.commentUser}>{comment.user}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.commentText, styles.commentEmpty]}>
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const openImageModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.gallery}
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
            <View key={post.id} style={styles.cardContainer}>
              {post.title && <Text style={styles.cardTitle}>{post.title}</Text>}

              <TouchableOpacity onPress={() => openImageModal(post)}>
                <Image style={styles.galleryImage} source={cover} />
              </TouchableOpacity>

              <View style={styles.cardInfo}>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardAuthor}>{post.author}</Text>
                  <Text style={styles.cardFollowers}>{post.followers}</Text>
                </View>

                <Text style={styles.timeText}>
                  {formatRelativeTime(post.postedAt)}
                </Text>

                <AuthorAvatar source={post.avatar} />
              </View>

              {post.description && (
                <Text style={styles.cardDescription} numberOfLines={2}>
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
  commentEmpty: {
    marginTop: 12,
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