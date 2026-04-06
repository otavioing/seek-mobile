import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// ---------------- TYPES ----------------

interface Comment {
  id: string;
  user: string;
  text: string;
}

interface PostData {
  id: string;
  author: string;
  followers: string;
  title?: string;
  imageUrl: any;
  avatar: any;
  likes: number;
  comments: Comment[];
}

type Theme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  statusBarIcon: string;
};

// ---------------- STORY MOCK (mantido) ----------------

const followingStories = [
  { id: '1', user: 'user1', storyImage: require('@/assets/images/tabsHome/imgT1.jpg') },
  { id: '2', user: 'user2', storyImage: require('@/assets/images/tabsHome/imgT2.jpg') },
];

const { width } = Dimensions.get('window');

// ---------------- COMPONENTS ----------------

const ModalHeader = ({ onClose, theme }: { onClose: () => void; theme: Theme }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color={theme.textPrimary} />
    <Text style={[styles.modalGoBackText, { color: theme.textPrimary }]}>Voltar</Text>
  </TouchableOpacity>
);

// ---------------- POST MODAL ----------------

const PostDetailModal = ({ visible, onClose, post, theme }: any) => {
  if (!post) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ScrollView>
          <ModalHeader onClose={onClose} theme={theme} />

          <View style={styles.modalHeader}>
            <Image source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={[styles.modalUserName, { color: theme.textPrimary }]}>{post.author}</Text>
          </View>

          {post.title ? <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{post.title}</Text> : null}
          <Image source={post.imageUrl} style={styles.modalImage} />

          <View style={styles.modalContent}>
            <View style={styles.likesContainer}>
              <Icon name="thumbs-up-outline" size={22} color={theme.textPrimary} />
              <Text style={[styles.likesText, { color: theme.textPrimary }]}>{post.likes} curtidas</Text>
            </View>

            <Text style={[styles.commentsTitle, { color: theme.textPrimary }]}>Comentários</Text>

            {post.comments.length > 0 ? (
              post.comments.map((comment: any) => (
                <View key={comment.id} style={[styles.commentContainer, { backgroundColor: theme.card }]}>
                  <Text style={[styles.commentUser, { color: theme.textPrimary }]}>{comment.user}</Text>
                  <Text style={[styles.commentText, { color: theme.textSecondary }]}>{comment.text}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.commentText, { color: theme.textSecondary }]}>Nenhum comentário ainda.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ---------------- AVATAR ----------------

interface AuthorAvatarProps {
  source: any;
  style?: StyleProp<ViewStyle>;
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
    {post.title ? <Text style={styles.cardTitle}>{post.title}</Text> : null}
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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const isFocused = useIsFocused();

  const theme: Theme = darkMode
    ? {
        background: '#000000',
        card: '#1a1a1a',
        textPrimary: '#FFFFFF',
        textSecondary: '#CCCCCC',
        statusBarIcon: '#FFFFFF',
      }
    : {
        background: '#E6E6E6',
        card: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#444444',
        statusBarIcon: '#111111',
      };

  // 🔥 BUSCAR POSTS DA API
  const buscarPosts = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');

      const response = await api.get(`/posts/posts-seguidos/${id}`);

      const dadosTratados = response.data.map((post: any) => ({
        id: String(post.id),

        author: post.user?.nome || 'Usuário',

        followers: `${post.total_seguidores || 0} seguidores`,

        title: post.titulo || '',

        imageUrl: {
          uri: post.imagens?.[0] || 'https://via.placeholder.com/300'
        },

        avatar: {
          uri: post.user?.foto || 'https://via.placeholder.com/100'
        },

        likes: post.total_likes || 0,

        comments: [], // depois você pode integrar de verdade
      }));

      setPosts(dadosTratados);
    } catch (error) {
      console.log('Erro ao buscar posts:', error);
    }
  };

  useEffect(() => {
    buscarPosts();
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

  const handleOpenPostModal = (post: PostData) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
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
            <TouchableOpacity key={post.id} onPress={() => handleOpenPostModal(post)}>
              <View style={[styles.cardContainer, { backgroundColor: theme.card }] }>
                {post.title ? <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{post.title}</Text> : null}
                <Image source={post.imageUrl} style={styles.galleryImage} />
                <View style={styles.cardInfo}>
                  <View>
                    <Text style={[styles.cardAuthor, { color: theme.textPrimary }]}>{post.author}</Text>
                    <Text style={[styles.cardFollowers, { color: theme.textSecondary }]}>{post.followers}</Text>
                  </View>
                  <AuthorAvatar source={post.avatar} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <PostDetailModal
        visible={isPostModalVisible}
        onClose={handleClosePostModal}
        post={selectedPost}
        theme={theme}
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

  modalContent: { padding: 16 },

  likesContainer: { flexDirection: 'row', alignItems: 'center' },
  likesText: { color: '#fff', marginLeft: 10 },

  commentsTitle: { color: '#fff', marginTop: 20 },

  commentContainer: { marginTop: 10 },
  commentUser: { color: '#fff', fontWeight: 'bold' },
  commentText: { color: '#ccc' },
});

export default SeguindoScreen;