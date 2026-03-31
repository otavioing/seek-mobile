import { Post } from '@/src/context/PostsContext';
import { api } from '@/src/services/api';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
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
  if (!post) return null;
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <ModalHeader onClose={onClose} />
          <View style={styles.modalHeader}>
            <Image source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={styles.modalUserName}>{post.author}</Text>
          </View>
          {post.images.map((img, idx) => (
            <Image key={idx} source={img} style={styles.modalImage} />
          ))}
          <View style={styles.modalContent}>
            {post.description ? <Text style={styles.modalDescription}>{post.description}</Text> : null}
            <View style={styles.likesContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="thumbs-up-outline" size={22} color="#fff" />
                <Text style={styles.likesText}>{post.likes} curtidas</Text>
              </View>
              <Text style={styles.timeText}>{formatRelativeTime(post.postedAt)}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const UserProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
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

  useEffect(() => {
    if (!userId) return;
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <ImageBackground source={banner} style={styles.headerBackground} />
          <Image source={avatar} style={styles.profileImage} />
          <Text style={styles.userName}>{userName || 'Perfil'}</Text>
          <Text style={styles.userHandle}>@usuario_{userId}</Text>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={fetchFollowers}>
            <Text style={styles.statNumber}>{stats.seguidores}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.likes}</Text>
            <Text style={styles.statLabel}>Curtidas</Text>
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
            <Text style={styles.placeholderText}>Nenhuma publicação.</Text>
          )}
        </View>
      </ScrollView>

      <PostDetailModal visible={isModalVisible} onClose={handleClosePost} post={selectedPost} />

      <Modal
        visible={followersModalVisible}
        animationType="slide"
        onRequestClose={() => setFollowersModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={styles.modalHeaderFollowers}>
            <Text style={styles.modalTitle}>Seguidores</Text>
            <TouchableOpacity onPress={() => setFollowersModalVisible(false)}>
              <Text style={{ color: '#fff' }}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {followers.map((follower) => (
              <View key={follower.id} style={styles.followerItem}>
                <Image
                  source={follower.foto ? { uri: follower.foto } : fallbackAvatar}
                  style={styles.followerAvatar}
                />
                <Text style={styles.followerName}>{follower.nome}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingBottom: 120 },
  headerContainer: { alignItems: 'center', paddingBottom: 24 },
  headerBackground: { width: '100%', height: 200, marginBottom: -70 },
  profileImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  userHandle: { fontSize: 14, color: '#888', marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 32, marginTop: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  contentContainer: { padding: 16 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photo: { width: photoSize, height: photoSize, borderRadius: 8, marginBottom: 8 },
  placeholderText: { color: '#fff', textAlign: 'center', marginTop: 20 },

  modalContainer: { flex: 1, backgroundColor: '#000' },
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
