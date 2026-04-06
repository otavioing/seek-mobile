import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Post, usePosts } from '../../src/context/PostsContext';


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

type TabName = 'Postagens' | 'Cursos';
type Theme = {
  background: string;
  backgroundAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  card: string;
  danger: string;
  tabInactive: string;
  tabActive: string;
  buttonPrimary: string;
  buttonSecondary: string;
  statusBar: 'light-content' | 'dark-content';
};

const { width } = Dimensions.get('window');
const photoSize = (width - 32 - 8) / 2;

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
  currentUserId?: string | null;
  currentUserName?: string;
  onOptions: (post: Post) => void;
  onPressAuthor?: (post: Post) => void;
}

const PostDetailModal = ({ visible, onClose, post, theme, currentUserId, currentUserName, onOptions, onPressAuthor }: PostDetailModalProps) => {
  if (!post) return null;

  const isOwner = (currentUserId && post.userId === currentUserId) || (!!currentUserName && post.author === currentUserName);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }] }>
        <ScrollView>
          <ModalHeader onClose={onClose} theme={theme} />

          <TouchableOpacity
            style={styles.modalHeader}
            disabled={!onPressAuthor || !post.userId}
            onPress={() => onPressAuthor?.(post)}
          >
            <Image source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={[styles.modalUserName, { color: theme.textPrimary }]}>{post.author}</Text>
            {isOwner && (
              <TouchableOpacity style={styles.moreButton} onPress={() => onOptions(post)}>
                <Icon name="ellipsis-vertical" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {post.title ? (
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{post.title}</Text>
          ) : null}
          {post.images.map((img, idx) => (
            <Image key={idx} source={img} style={styles.modalImage} />
          ))}

          <View style={styles.modalContent}>
            {post.description ? (
              <Text style={[styles.modalDescription, { color: theme.textPrimary }]}>{post.description}</Text>
            ) : null}
            <View style={[styles.likesContainer, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="thumbs-up-outline" size={22} color={theme.textPrimary} />
                <Text style={[styles.likesText, { color: theme.textPrimary }]}>{post.likes} curtidas</Text>
              </View>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatRelativeTime(post.postedAt)}</Text>
            </View>
            <Text style={[styles.commentsTitle, { color: theme.textPrimary }]}>Comentários</Text>
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <View key={comment.id} style={[styles.commentContainer, { backgroundColor: theme.backgroundAlt }]}>
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


interface SimpleImageModalProps {
  visible: boolean;
  onClose: () => void;
  image: ImageSourcePropType | null;
  theme: Theme;
}

const SimpleImageModal = ({ visible, onClose, image, theme }: SimpleImageModalProps) => {
  if (!image) return null;

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ModalHeader onClose={onClose} theme={theme} />
        <View style={styles.simpleImageContainer}>
          <Image
            source={image}
            style={styles.simpleImage}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};


const ProfileScreen = () => {
  const [userStats, setUserStats] = useState({
    seguidores: 0,
    posts: 0,
    likes: 0,
  });

  const [followers, setFollowers] = useState<any[]>([]);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);

  const { posts, removePost, refreshPosts } = usePosts();
  const routerHook = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('Postagens');

  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<ImageSourcePropType | null>(null);

  const headerFallback = require('../../assets/images/perfil/denji.jpg');
  const [headerImageUrl, setHeaderImageUrl] = useState<any>(headerFallback);
  const profileFallback = require('../../assets/images/perfil/denji.jpg');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<ImageSourcePropType>(profileFallback);

  const [optionsPost, setOptionsPost] = useState<Post | null>(null);
  const [showInlineMenu, setShowInlineMenu] = useState(false);
  const [remoteUserPosts, setRemoteUserPosts] = useState<Post[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const theme: Theme = darkMode
    ? {
        background: '#000000',
        backgroundAlt: '#1a1a1a',
        textPrimary: '#FFFFFF',
        textSecondary: '#DDDDDD',
        textMuted: '#AAAAAA',
        border: '#333333',
        card: '#111111',
        danger: '#ff5c5c',
        tabInactive: '#888888',
        tabActive: '#FFFFFF',
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
        danger: '#D32F2F',
        tabInactive: '#666666',
        tabActive: '#111111',
        buttonPrimary: '#007BFF',
        buttonSecondary: '#4F46E5',
        statusBar: 'dark-content',
      };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        setCurrentUserId(uid);
        console.log('userId salvo no AsyncStorage:', uid);
        if (!uid) return;

        // 🔹 FOTO DE PERFIL
        const response = await api.get(`/usuarios/foto-perfil/${uid}`);
        const data = response.data;

        setUserName(data?.nome || '');

        if (data?.foto) {
          setUserAvatar({ uri: data.foto });
        }

        // 🔥 BANNER (NOVO)
        const bannerResponse = await api.get(`/usuarios/foto-banner/${uid}`);
        const bannerData = bannerResponse.data;

        if (bannerData?.banner) {
          setHeaderImageUrl({ uri: bannerData.banner });
        }

        // 🔥 STATS (seguidores, posts, likes)
        const statsResponse = await api.get(`/usuarios/numero-posts-seguidores-likes/${uid}`);
        const statsData = statsResponse.data;

        setUserStats({
          seguidores: statsData.total_seguidores ?? 0,
          posts: statsData.total_posts ?? 0,
          likes: statsData.total_likes ?? 0,
        });

      } catch (error) {
        console.log('Erro ao carregar usuário no perfil:', error);
      }
    };




    loadUser();
    refreshPosts();
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

    loadTheme();
  }, []);

  const fetchFollowers = async () => {
    if (!currentUserId) return;

    try {
      const { data } = await api.get(`/usuarios/lista-seguidores/${currentUserId}`);
      setFollowers(data);
      setFollowersModalVisible(true);
    } catch (error) {
      console.log('Erro ao buscar seguidores:', error);
    }
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUserId) return;
      try {
        const { data } = await api.get(`/posts/usuario/${currentUserId}`);
        const mapped: Post[] = (data || []).map((post: any) => ({
          id: String(post.id),

          author: post.user?.nome || 'Usuário',

          userId: currentUserId || undefined, // sua API não manda mais user_id

          followers: `${post.total_seguidores ?? 0} seguidores`,

          title: post.titulo || '',

          description: post.legenda,

          postedAt: post.criado_em
            ? new Date(post.criado_em).getTime()
            : Date.now(),

          likes: post.total_likes ?? 0,

          images: post.imagens?.map((img: string) => ({
            uri: img
          })) || [],

          avatar: post.user?.foto
            ? { uri: post.user.foto }
            : userAvatar,

          comments: [],
        }));
        setRemoteUserPosts(mapped);
      } catch (error) {
        console.log('Erro ao buscar posts do usuário:', error);
      }
    };

    fetchUserPosts();
  }, [currentUserId, userAvatar]);

  const userPosts = useMemo(() => {
    // 1) Primeiro tenta pelo userId
    const mineById = currentUserId ? posts.filter((p) => p.userId === currentUserId) : [];
    if (mineById.length) return mineById;

    // 2) Fallback por nome do usuário carregado da API
    const mineByName = userName ? posts.filter((p) => p.author === userName) : [];
    if (mineByName.length) return mineByName;

    // 3) Último fallback: posts marcados como "Você" (caso ainda não tenha info do usuário)
    return posts.filter((p) => p.author === 'Você');
  }, [posts, currentUserId, userName]);

  const galleryPosts = useMemo(() => userPosts, [userPosts]);
  const displayPosts = remoteUserPosts.length ? remoteUserPosts : galleryPosts;

  const handleOpenPostModal = (post: Post) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };

  const handleOpenAuthorProfile = (post: Post) => {
    if (!post.userId) return;
    setIsPostModalVisible(false);
    routerHook.push(`/usuario/${post.userId}` as any);
  };
  const handleClosePostModal = () => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
    setShowInlineMenu(false);
    setOptionsPost(null);
  };

  const handleOpenProfileModal = (image: ImageSourcePropType) => {
    setSelectedProfileImage(image);
    setIsProfileModalVisible(true);
  };
  const handleCloseProfileModal = () => {
    setIsProfileModalVisible(false);
    setSelectedProfileImage(null);
  };

  const renderTabButton = (tabName: TabName) => (
    <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab(tabName)}>
      <Text
        style={[
          styles.tabText,
          { color: activeTab === tabName ? theme.tabActive : theme.tabInactive },
          activeTab === tabName && styles.activeTabText,
        ]}
      >
        {tabName}
      </Text>
      {activeTab === tabName && <View style={[styles.activeTabIndicator, { backgroundColor: theme.tabActive }]} />}
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'Postagens') {
      if (!displayPosts.length) {
        return <Text style={[styles.placeholderText, { color: theme.textPrimary }]}>Você ainda não publicou nada.</Text>;
      }
      return (
        <View style={styles.photoGrid}>
          {displayPosts.map((post) => {
            const cover = post.images[0];
            if (!cover) return null;
            return (
              <TouchableOpacity key={post.id} onPress={() => handleOpenPostModal(post)}>
                <Image source={cover} style={styles.photo} />
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    if (activeTab === 'Cursos') {
      return <Text style={[styles.placeholderText, { color: theme.textPrimary }]}>Seção de Cursos</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.bannerTouchable} onPress={() => handleOpenProfileModal(headerImageUrl)}>
            <ImageBackground
              source={headerImageUrl}
              style={styles.headerBackground}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenProfileModal(userAvatar)}>
            <Image source={userAvatar} style={[styles.profileImage, { borderColor: theme.card }]} />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{userName || 'Meu perfil'}</Text>
          <Text style={[styles.userRole, { color: theme.textSecondary }]}>Empresa</Text>
          <Text style={[styles.userHandle, { color: theme.textMuted }]}>@seeking</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TouchableOpacity onPress={fetchFollowers}>
                <View style={styles.statRow}>
                  <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{userStats.seguidores}</Text>
                  <Image
                    source={require('@/assets/images/seguindo.png')}
                    style={styles.statIcon}
                  />
                </View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Seguidores</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.statItem}>
              <View style={styles.statRow}>
                <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{userStats.posts}</Text>
                <Image
                  source={require('@/assets/images/papel_dobrado.png')}
                  style={styles.statIcon}
                />
              </View>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Posts</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statRow}>
                <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{userStats.likes}</Text>
                <Image
                  source={require('@/assets/images/likes.png')}
                  style={styles.statIcon}
                />
              </View>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Curtidas</Text>

            </View>
          </View>

        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimary }]}>
            <Text style={styles.buttonText}>Seguir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonSecondary }]}>
            <Text style={styles.buttonText}>Contratar</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
          {renderTabButton('Postagens')}
          {renderTabButton('Cursos')}
        </View>
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      </ScrollView>

      <PostDetailModal
        visible={isPostModalVisible}
        onClose={handleClosePostModal}
        post={selectedPost}
        theme={theme}
        currentUserId={currentUserId}
        currentUserName={userName}
        onOptions={(post) => {
          setOptionsPost(post);
          setShowInlineMenu(true);
        }}
        onPressAuthor={handleOpenAuthorProfile}
      />
      <SimpleImageModal
        visible={isProfileModalVisible}
        onClose={handleCloseProfileModal}
        image={selectedProfileImage}
        theme={theme}
      />

      <Modal
        visible={followersModalVisible}
        animationType="slide"
        onRequestClose={() => setFollowersModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>

          {/* HEADER */}
          <View style={[styles.modalHeaderFollowers, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Seguidores</Text>
            <TouchableOpacity onPress={() => setFollowersModalVisible(false)}>
              <Text style={{ color: theme.textPrimary }}>Fechar</Text>
            </TouchableOpacity>
          </View>

          {/* LISTA */}
          <ScrollView>
            {followers.map((follower) => (
              <View key={follower.id} style={[styles.followerItem, { borderBottomColor: theme.border }]}>
                <Image
                  source={{ uri: follower.foto }}
                  style={styles.followerAvatar}
                />
                <Text style={[styles.followerName, { color: theme.textPrimary }]}>{follower.nome}</Text>
              </View>
            ))}
          </ScrollView>

        </SafeAreaView>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={!!optionsPost && showInlineMenu}
        onRequestClose={() => { setShowInlineMenu(false); setOptionsPost(null); }}
      >
        <View style={styles.inlineOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.inlineBackdrop}
            onPress={() => { setShowInlineMenu(false); setOptionsPost(null); }}
          />
          <View style={styles.inlineBox}>
            <TouchableOpacity
              style={styles.inlineItem}
              onPress={() => {
                if (!optionsPost) return;
                router.push({ pathname: '/editarPost', params: { id: optionsPost.id } as any });
                setShowInlineMenu(false);
                setOptionsPost(null);
              }}
            >
              <Text style={[styles.optionText, { color: theme.textPrimary }]}>Editar post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inlineItem, styles.optionDelete]}
              onPress={async () => {
                if (!optionsPost) return;
                await removePost(optionsPost.id);
                setRemoteUserPosts((prev) => prev.filter((p) => p.id !== optionsPost.id));
                await refreshPosts();
                setShowInlineMenu(false);
                setOptionsPost(null);
              }}
            >
              <Text style={[styles.optionText, styles.optionDeleteText, { color: theme.danger }]}>Excluir post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inlineItem} onPress={() => { setShowInlineMenu(false); setOptionsPost(null); }}>
              <Text style={[styles.optionText, { color: theme.textPrimary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerContainer: { alignItems: 'center' },
  bannerTouchable: { width: '100%' },
  headerBackground: { width: '100%', height: 200 },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#fff', marginTop: -75 },
  userInfoContainer: { alignItems: 'center', marginTop: 16 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  userRole: { fontSize: 16, color: '#ccc', marginTop: 4 },
  userHandle: { fontSize: 14, color: '#888', marginTop: 4 },
  userIdDebug: { fontSize: 12, color: '#666', marginTop: 2 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingHorizontal: 20 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 25, marginHorizontal: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, borderBottomWidth: 1, borderBottomColor: '#333' },
  tabButton: { paddingHorizontal: 16 },
  tabText: { color: '#888', fontSize: 16, paddingBottom: 12 },
  activeTabText: { fontWeight: 'bold' },
  activeTabIndicator: { height: 3, backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 0, right: 0 },
  contentContainer: { padding: 16 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photo: { width: photoSize, height: photoSize, borderRadius: 8, marginBottom: 8 },
  placeholderText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 30 },

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
  moreButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  modalUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalImage: {
    width: '100%',
    height: width,
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
  timeText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 12,
  },
  modalDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 8,
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
    marginBottom: 16,
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

  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  optionsCard: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  optionDelete: {
    borderBottomColor: '#222',
  },
  optionDeleteText: {
    color: '#ff5c5c',
    fontWeight: 'bold',
  },
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  inlineBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  inlineBox: {
    marginTop: 80,
    marginRight: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 6,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  inlineItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },

  simpleImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleImage: {
    width: '100%',
    height: '80%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIcon: {
    width: 18,
    height: 18,
    marginLeft: 6,
  },
  modalHeaderFollowers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },

  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },

  followerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  followerName: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ProfileScreen;