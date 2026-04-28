import { Post } from '@/src/context/PostsContext';
import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const photoSize = (width - 32 - 8) / 2;

type Theme = {
  background: string;
  backgroundAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  card: string;
  buttonPrimary: string;
  buttonSecondary: string;
  statusBar: 'light-content' | 'dark-content';
};

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
}

const PostDetailModal = ({ visible, onClose, post, theme }: PostDetailModalProps) => {
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
          {post.images.map((img, idx) => (
            <Image key={idx} source={img} style={styles.modalImage} />
          ))}
          <View style={styles.modalContent}>
            {post.description ? <Text style={[styles.modalDescription, { color: theme.textPrimary }]}>{post.description}</Text> : null}
            <View style={[styles.likesContainer, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="thumbs-up-outline" size={22} color={theme.textPrimary} />
                <Text style={[styles.likesText, { color: theme.textPrimary }]}>{post.likes} curtidas</Text>
              </View>
              <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatRelativeTime(post.postedAt)}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const UserProfileScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const isFocused = useIsFocused();
  const userId = useMemo(() => (Array.isArray(id) ? id[0] : id) || '', [id]);
  const fallbackAvatar = useMemo(() => require('../../assets/images/perfil/denji.jpg'), []);
  const fallbackBanner = useMemo(() => require('../../assets/images/perfil/denji.jpg'), []);

  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState<any>(fallbackAvatar);
  const [banner, setBanner] = useState<any>(fallbackBanner);
  const [stats, setStats] = useState({ seguidores: 0, posts: 0, likes: 0 });
  const [followers, setFollowers] = useState<any[]>([]);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const theme: Theme = darkMode
    ? {
        background: '#000000',
        backgroundAlt: '#0F0F0F',
        textPrimary: '#FFFFFF',
        textSecondary: '#DDDDDD',
        textMuted: '#888888',
        border: '#333333',
        card: '#1a1a1a',
        buttonPrimary: '#007BFF',
        buttonSecondary: '#4F46E5',
        statusBar: 'light-content',
      }
    : {
        background: '#E6E6E6',
        backgroundAlt: '#F6F6F6',
        textPrimary: '#111111',
        textSecondary: '#333333',
        textMuted: '#666666',
        border: '#CFCFCF',
        card: '#FFFFFF',
        buttonPrimary: '#007BFF',
        buttonSecondary: '#4F46E5',
        statusBar: 'dark-content',
      };

  useEffect(() => {
    if (!userId) return;
    const loadCurrent = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        setCurrentUserId(uid);
        if (uid && uid !== userId) {
          try {
            const resp = await api.get(`/usuarios/esta-seguindo/${userId}`);
            if (resp?.data && typeof resp.data.seguindo !== 'undefined') {
              setIsFollowing(!!resp.data.seguindo);
            } else if (resp?.data === true || resp?.data === false) {
              setIsFollowing(!!resp.data);
            }
          } catch (e) {
            console.log('Erro ao verificar seguimento:', e);
          }
        }
      } catch (e) {
        console.log('Erro ao carregar userId', e);
      }
    };
    loadCurrent();
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/usuarios/foto-perfil/${userId}`);
        setUserName(data?.nome || '');
        if (data?.foto) setAvatar({ uri: data.foto });
      } catch (e) {
        console.log('Erro ao buscar usuário', e);
      }
    };

    const fetchBanner = async () => {
        try {
          const { data } = await api.get(`/usuarios/foto-banner/${userId}`);
          if (data?.banner) setBanner({ uri: data.banner });
        } catch (e) {
          console.log('Erro ao buscar banner do usuário', e);
        }
      };

    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/usuarios/numero-posts-seguidores-likes/${userId}`);
        setStats({
          seguidores: data?.total_seguidores ?? 0,
          posts: data?.total_posts ?? 0,
          likes: data?.total_likes ?? 0,
        });
      } catch (e) {
        console.log('Erro ao buscar stats do usuário', e);
      }
    };

    const fetchPosts = async () => {
      try {
        const { data } = await api.get(`/posts/usuario/${userId}`);
        const mapped: Post[] = (data || []).map((post: any) => ({
          id: String(post.id),
          author: post.nome,
          userId: post.user_id ? String(post.user_id) : String(userId),
          followers: `${post.total_seguidores ?? 0} seguidores`,
          description: post.legenda,
          postedAt: post.criado_em ? new Date(post.criado_em).getTime() : Date.now(),
          likes: post.total_likes ?? 0,
          images: Array.isArray(post.imagens)
            ? post.imagens.map((img: string) => ({ uri: img }))
            : post.imagem
              ? [{ uri: post.imagem }]
              : [],
          avatar: post.foto_perfil ? { uri: post.foto_perfil } : fallbackAvatar,
          comments: [],
        }));
        setPosts(mapped);
      } catch (e) {
        console.log('Erro ao buscar posts do usuário', e);
      }
    };

    fetchUser();
    fetchBanner();
    fetchStats();
    fetchPosts();
  }, [userId, fallbackAvatar]);

  useEffect(() => {
    if (!isFocused) return;

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('tema');
        setDarkMode(savedTheme === 'escuro');
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };

    loadTheme();
  }, [isFocused]);

  const fetchFollowers = async () => {
    try {
      const { data } = await api.get(`/usuarios/lista-seguidores/${userId}`);
      setFollowers(data || []);
      setFollowersModalVisible(true);
    } catch (error) {
      console.log('Erro ao buscar seguidores:', error);
    }
  };

  const displayPosts = useMemo(() => posts.filter(p => p.images.length), [posts]);

  const handleOpenPost = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleClosePost = () => {
    setSelectedPost(null);
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
            <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <ImageBackground source={banner} style={styles.headerBackground} resizeMode="cover" />
          <Image source={avatar} style={[styles.profileImage, { borderColor: theme.card }]} />
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{userName || 'Perfil'}</Text>
          <Text style={[styles.userHandle, { color: theme.textMuted }]}>@usuario_{userId}</Text>
          {currentUserId !== userId && (
            <TouchableOpacity
              style={[styles.followButton, isFollowing ? styles.following : styles.follow]}
              onPress={async () => {
                if (!currentUserId) {
                  Alert.alert('Atenção', 'Faça login para seguir usuários.');
                  return;
                }
                if (isProcessing) return;
                setIsProcessing(true);
                const next = !isFollowing;
                setIsFollowing(next);
                setStats((s) => ({ ...s, seguidores: next ? s.seguidores + 1 : Math.max(0, s.seguidores - 1) }));
                try {
                  if (next) await api.post(`/usuarios/seguir/${userId}`);
                  else await api.delete(`/usuarios/seguir/${userId}`);
                } catch (e) {
                  console.log('Erro ao (un)follow:', e);
                  // revert
                  setIsFollowing(!next);
                  setStats((s) => ({ ...s, seguidores: next ? Math.max(0, s.seguidores - 1) : s.seguidores + 1 }));
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={isProcessing}
            >
              <Text style={styles.followText}>{isFollowing ? 'Seguindo' : 'Seguir'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={fetchFollowers}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.seguidores}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Seguidores</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.posts}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.likes}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Curtidas</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {displayPosts.length ? (
            <View style={styles.photoGrid}>
              {displayPosts.map((post) => (
                <TouchableOpacity key={post.id} onPress={() => handleOpenPost(post)}>
                  <Image source={post.images[0]} style={styles.photo} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.placeholderText, { color: theme.textPrimary }]}>Nenhuma publicação.</Text>
          )}
        </View>
      </ScrollView>

      <PostDetailModal visible={isModalVisible} onClose={handleClosePost} post={selectedPost} theme={theme} />

      <Modal
        visible={followersModalVisible}
        animationType="slide"
        onRequestClose={() => setFollowersModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={[styles.modalHeaderFollowers, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Seguidores</Text>
            <TouchableOpacity onPress={() => setFollowersModalVisible(false)}>
              <Text style={{ color: theme.textPrimary }}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {followers.map((follower) => (
              <View key={follower.id} style={[styles.followerItem, { borderBottomColor: theme.border }]}>
                <Image
                  source={follower.foto ? { uri: follower.foto } : fallbackAvatar}
                  style={styles.followerAvatar}
                />
                <Text style={[styles.followerName, { color: theme.textPrimary }]}>{follower.nome}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backIcon: {
    marginRight: 0,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '700',
  },
  headerContainer: { alignItems: 'center', paddingBottom: 24 },
  headerBackground: { width: '100%', height: 200, marginBottom: -70 },
  profileImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 3 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  userHandle: { fontSize: 14, color: '#888', marginTop: 4 },
  followButton: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  follow: { backgroundColor: '#007bff' },
  following: { backgroundColor: '#4f4f4f' },
  followText: { color: '#fff', fontWeight: '700' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 32, marginTop: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  contentContainer: { padding: 16 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photo: { width: photoSize, height: photoSize, borderRadius: 8, marginBottom: 8 },
  placeholderText: { color: '#fff', textAlign: 'center', marginTop: 20 },

  modalContainer: { flex: 1 },
  modalGoBack: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  modalGoBackText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  modalUserAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  modalUserName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalImage: { width: '100%', height: width, resizeMode: 'cover', marginTop: 12 },
  modalContent: { padding: 20 },
  likesContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  timeText: { color: '#aaa', fontSize: 12, marginLeft: 12 },
  modalDescription: { color: '#fff', fontSize: 16, marginBottom: 12 },
  likesText: { color: '#fff', fontSize: 16, marginLeft: 10 },
  modalHeaderFollowers: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  followerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#111' },
  followerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  followerName: { color: '#fff', fontSize: 14 },
});

export default UserProfileScreen;
