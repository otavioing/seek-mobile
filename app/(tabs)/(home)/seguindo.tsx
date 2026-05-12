import { Comment, useComments } from '@/src/context/CommentsContext';
import { useFollowedPosts } from '@/src/context/FollowedPostsContext';
import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageStyle,
  SafeAreaView,
  ScrollView,
  Share,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FollowingTheme, getFollowingTheme } from '../../../src/theme/appTheme';

// ---------------- TYPES ----------------

interface PostData {
  id: string;
  author: string;
  userId?: string;
  followers: string;
  title?: string;
  description?: string;
  imageUrl: any;
  avatar: any;
  likes: number;
  comments: Comment[];
}

// ---------------- STORY MOCK (mantido) ----------------

const followingStories = [
  { id: '1', user: 'user1', storyImage: require('@/assets/images/tabsHome/imgT1.jpg') },
  { id: '2', user: 'user2', storyImage: require('@/assets/images/tabsHome/imgT2.jpg') },
];

const { width } = Dimensions.get('window');

// ---------------- COMPONENTS ----------------

const ModalHeader = ({ onClose, theme }: { onClose: () => void; theme: FollowingTheme }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color={theme.textPrimary} />
    <Text style={[styles.modalGoBackText, { color: theme.textPrimary }]}>Voltar</Text>
  </TouchableOpacity>
);

// ---------------- POST MODAL ----------------

const PostDetailModal = ({ visible, onClose, post, theme, onPressCommentAuthor, onPressAuthor }: any) => {
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToUserName, setReplyToUserName] = useState('');
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
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
      console.log('Erro ao carregar likes:', err);
    }
  };

  useEffect(() => {
    if (!post?.id || !visible) return;

    fetchComments(post.id);
    carregarLikes();
    setCommentText('');
    setReplyToCommentId(null);
    setReplyToUserName('');
    setIsCommentsVisible(false);
  }, [post, visible]);

  const handleToggleLike = async () => {
    if (!post?.id) return;

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

  if (!post || !visible) return null;

  const comments = commentsByPost[post.id] || [];
  const postImages = Array.isArray(post.imageUrl) ? post.imageUrl : [post.imageUrl];

  const handleShare = async () => {
    try {
      const message = [post?.title, post?.description].filter(Boolean).join('\n\n') || 'Confira este post!';
      await Share.share({ message });
    } catch {
      // no-op
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, zIndex: 100 }]}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ScrollView>
          <ModalHeader onClose={onClose} theme={theme} />

          <TouchableOpacity
            style={styles.modalHeader}
            disabled={!onPressAuthor || !post.userId}
            onPress={() => onPressAuthor?.(post)}
          >
            <Image source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={[styles.modalUserName, { color: theme.textPrimary }]}>{post.author}</Text>
          </TouchableOpacity>

          {post.title ? <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{post.title}</Text> : null}

          <View style={styles.imageWrapper}>
            <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>
              {postImages.map((img: any, idx: number) => (
                <Image key={idx} source={img} style={styles.modalImage} />
              ))}
            </ScrollView>

            <View style={styles.modalToolbarOverlay}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.75}>
                <Icon name="share-social-outline" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.75}>
                <Icon name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={() => setIsCommentsVisible(true)} activeOpacity={0.75}>
                <Icon name="chatbubble-outline" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={handleToggleLike} activeOpacity={0.75}>
                <Icon
                  name={liked ? "thumbs-up" : "thumbs-up-outline"}
                  size={22}
                  color={liked ? "#2563EB" : "#fff"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.likesContainer}>
              <TouchableOpacity style={styles.likesButton} onPress={handleToggleLike} activeOpacity={0.7}>
                <Icon name={liked ? 'thumbs-up' : 'thumbs-up-outline'} size={22} color={liked ? '#2563EB' : theme.textPrimary} />
                <Text style={[styles.likesText, { color: theme.textPrimary }, liked && { color: '#2563EB' }]}>{likesCount} curtidas</Text>
              </TouchableOpacity>
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
                        style={[styles.commentInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
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
              comments.map((comment: Comment) => renderCommentItem(comment))
            ) : (
              <Text style={[styles.commentText, styles.commentEmpty, { color: theme.textSecondary }]}>Nenhum comentário ainda.</Text>
            )}
          </View>
        </ScrollView>

        {isCommentsVisible && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, zIndex: 101 }]}>
            <SafeAreaView style={[styles.commentsModalContainer, { backgroundColor: theme.background }]}>
              <View style={styles.commentsModalHeader}>
                <TouchableOpacity onPress={() => setIsCommentsVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="close" size={26} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.commentsModalTitle, { color: theme.textPrimary }]}>Comentários</Text>
                <View style={{ width: 26 }} />
              </View>

              <ScrollView contentContainerStyle={styles.commentsModalContent}>
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
                            style={[styles.commentInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
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
                  comments.map((comment: Comment) => renderCommentItem(comment))
                ) : (
                  <Text style={[styles.commentText, styles.commentEmpty, { color: theme.textSecondary }]}>Nenhum comentário ainda.</Text>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

// ---------------- AVATAR ----------------

interface AuthorAvatarProps {
  source: any;
  style?: StyleProp<ImageStyle>;
  isStory?: boolean;
}

const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ source, style, isStory }) => (
  <Image
    source={source}
    style={[styles.avatar, isStory ? styles.storyAvatar : null, style]}
  />
);

// ---------------- POST CARD ----------------

const PostCard = ({ post }: { post: PostData }) => (
  <View style={styles.cardContainer}>
    {/* Title intentionally omitted here to match prototype; title is shown in the modal when the post is opened */}
    <Image source={post.imageUrl} style={styles.galleryImage} />

    <View style={styles.cardInfo}>
      <View>
        <Text style={styles.cardAuthor}>{post.author}</Text>
        <Text style={styles.cardFollowers}>{post.followers}</Text>
      </View>

      <AuthorAvatar source={post.avatar} />
    </View>
  </View>
);

// ---------------- MAIN SCREEN ----------------

const SeguindoScreen = () => {
  const router = useRouter();
  const { posts, refreshPosts } = useFollowedPosts();
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const isFocused = useIsFocused();

  const theme = getFollowingTheme(darkMode);

  useEffect(() => {
    if (isFocused) {
      refreshPosts();
    }
  }, [isFocused]);

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

  const handleOpenPostModal = (post: PostData) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
  };

  const handleOpenAuthorProfile = (post: PostData) => {
    if (!post?.userId) {
      Alert.alert('Perfil indisponível', 'Este post não retornou o id do usuário na API.');
      return;
    }
    setIsPostModalVisible(false);
    router.push(`/usuario/${post.userId}` as any);
  };

  const handleOpenCommentAuthorProfile = (comment: Comment) => {
    if (!comment?.userId) return;
    setIsPostModalVisible(false);
    router.push(`/usuario/${comment.userId}` as any);
  };

  const handleOpenPostAuthorProfile = (post: PostData) => {
    if (!post?.userId) {
      Alert.alert('Perfil indisponível', 'Este post não retornou o id do usuário na API.');
      return;
    }
    router.push(`/usuario/${post.userId}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* STORIES */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {followingStories.map((story) => (
              <View key={story.id} style={styles.story}>
                <AuthorAvatar source={story.storyImage} isStory />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* FEED */}
        <View style={styles.feedContainer}>
          {posts.map((post) => (
            <View key={post.id} style={[styles.cardContainer, { backgroundColor: theme.card }] }>
              {/* Title intentionally omitted here to match prototype; title is shown in the modal when the post is opened */}
              <TouchableOpacity onPress={() => handleOpenPostModal(post as any)} activeOpacity={0.9}>
                <Image source={post.imageUrl} style={styles.galleryImage} />
              </TouchableOpacity>
              <View style={styles.cardInfo}>
                <View>
                  <Text style={[styles.cardAuthor, { color: theme.textPrimary }]}>{post.author}</Text>
                  <Text style={[styles.cardFollowers, { color: theme.textSecondary }]}>{post.followers}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenPostAuthorProfile(post as any)}
                  activeOpacity={0.7}
                >
                  <AuthorAvatar source={post.avatar} />
                </TouchableOpacity>
              </View>

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
          ))}
        </View>
      </ScrollView>

      <PostDetailModal
        visible={isPostModalVisible}
        onClose={handleClosePostModal}
        post={selectedPost}
        theme={theme}
        onPressAuthor={handleOpenAuthorProfile}
        onPressCommentAuthor={handleOpenCommentAuthorProfile}
      />
    </View>
  );
};

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingBottom: 120 },

  storiesContainer: { padding: 12 },
  story: { marginRight: 16 },

  avatar: { width: 40, height: 40, borderRadius: 20 },
  storyAvatar: { width: 64, height: 64, borderRadius: 32 },

  feedContainer: { padding: 16 },

  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 8,
  },

  galleryImage: { width: '100%', height: 350 },

  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },

  cardAuthor: { color: '#fff', fontWeight: 'bold' },
  cardFollowers: { color: '#aaa', fontSize: 12 },
  cardDescription: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  modalContainer: { flex: 1, backgroundColor: '#000' },

  modalGoBack: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  modalGoBackText: { color: '#fff', marginLeft: 8 },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  modalUserName: { color: '#fff', fontWeight: 'bold' },

  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },

  modalImage: { width: '100%', height: width },

  imageWrapper: {
    position: 'relative',
  },
  modalToolbarOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '700',
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
  commentEmpty: { marginTop: 12 },

  commentsModalContainer: {
    flex: 1,
  },
  commentsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentsModalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  commentsModalContent: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default SeguindoScreen;