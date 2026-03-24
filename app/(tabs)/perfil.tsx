import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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

const { width } = Dimensions.get('window');
const photoSize = (width - 32 - 8) / 2;

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
  currentUserId?: string | null;
  currentUserName?: string;
  onOptions: (post: Post) => void;
}

const PostDetailModal = ({ visible, onClose, post, currentUserId, currentUserName, onOptions }: PostDetailModalProps) => {
  if (!post) return null;

  const isOwner = (currentUserId && post.userId === currentUserId) || (!!currentUserName && post.author === currentUserName);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <ModalHeader onClose={onClose} />

          <View style={styles.modalHeader}>
            <Image source={post.avatar} style={styles.modalUserAvatar} />
            <Text style={styles.modalUserName}>{post.author}</Text>
            {isOwner && (
              <TouchableOpacity style={styles.moreButton} onPress={() => onOptions(post)}>
                <Icon name="ellipsis-vertical" size={22} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          {post.images.map((img, idx) => (
            <Image key={idx} source={img} style={styles.modalImage} />
          ))}

          <View style={styles.modalContent}>
            {post.description ? (
              <Text style={styles.modalDescription}>{post.description}</Text>
            ) : null}
            <View style={styles.likesContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="thumbs-up-outline" size={22} color="#fff" />
                <Text style={styles.likesText}>{post.likes} curtidas</Text>
              </View>
              <Text style={styles.timeText}>{formatRelativeTime(post.postedAt)}</Text>
            </View>
            <Text style={styles.commentsTitle}>Comentários</Text>
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <View key={comment.id} style={styles.commentContainer}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
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


interface SimpleImageModalProps {
  visible: boolean;
  onClose: () => void;
  image: ImageSourcePropType | null;
}

const SimpleImageModal = ({ visible, onClose, image }: SimpleImageModalProps) => {
  if (!image) return null;

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ModalHeader onClose={onClose} />
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
  const { posts, removePost, refreshPosts } = usePosts();
  const [activeTab, setActiveTab] = useState<TabName>('Postagens');

  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<ImageSourcePropType | null>(null);

  const headerImageUrl = require('../../assets/images/perfil/bannerDenji.jpg');
  const profileFallback = require('../../assets/images/perfil/denji.jpg');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<ImageSourcePropType>(profileFallback);

  const [optionsPost, setOptionsPost] = useState<Post | null>(null);
  const [showInlineMenu, setShowInlineMenu] = useState(false);
  const [remoteUserPosts, setRemoteUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        setCurrentUserId(uid);
        console.log('userId salvo no AsyncStorage:', uid);
        if (!uid) return;

        const response = await api.get(`/usuarios/foto-perfil/${uid}`);
        const data = response.data;
        setUserName(data?.nome || '');
        if (data?.foto) {
          setUserAvatar({ uri: data.foto });
        }
      } catch (error) {
        console.log('Erro ao carregar usuário no perfil:', error);
      }
    };

    loadUser();
    refreshPosts();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUserId) return;
      try {
        const { data } = await api.get(`/posts/usuario/${currentUserId}`);
        const mapped: Post[] = (data || []).map((post: any) => ({
          id: String(post.id),
          author: post.nome,
          userId: post.user_id ? String(post.user_id) : currentUserId,
          followers: `${post.total_seguidores ?? 0} seguidores`,
          description: post.legenda,
          postedAt: post.criado_em ? new Date(post.criado_em).getTime() : Date.now(),
          likes: 0,
          images: post.imagem ? [{ uri: post.imagem }] : [],
          avatar: post.foto_perfil ? { uri: post.foto_perfil } : userAvatar,
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
      <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
        {tabName}
      </Text>
      {activeTab === tabName && <View style={styles.activeTabIndicator} />}
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'Postagens') {
      if (!displayPosts.length) {
        return <Text style={styles.placeholderText}>Você ainda não publicou nada.</Text>;
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
      return <Text style={styles.placeholderText}>Seção de Cursos</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => handleOpenProfileModal(headerImageUrl)}>
            <ImageBackground
              source={headerImageUrl}
              style={styles.headerBackground}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenProfileModal(userAvatar)}>
            <Image
              source={userAvatar}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userName || 'Meu perfil'}</Text>
          <Text style={styles.userRole}>Empresa</Text>
          <Text style={styles.userHandle}>@seeking</Text>
          <Text style={styles.userIdDebug}>
            {currentUserId ? `userId: ${currentUserId}` : 'userId não encontrado no dispositivo'}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.followButton]}>
            <Text style={styles.buttonText}>Seguir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.hireButton]}>
            <Text style={styles.buttonText}>Contratar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabBar}>
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
        currentUserId={currentUserId}
        currentUserName={userName}
        onOptions={(post) => {
          setOptionsPost(post);
          setShowInlineMenu(true);
        }}
      />
      <SimpleImageModal
        visible={isProfileModalVisible}
        onClose={handleCloseProfileModal}
        image={selectedProfileImage}
      />

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
              <Text style={styles.optionText}>Editar post</Text>
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
              <Text style={[styles.optionText, styles.optionDeleteText]}>Excluir post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inlineItem} onPress={() => { setShowInlineMenu(false); setOptionsPost(null); }}>
              <Text style={styles.optionText}>Cancelar</Text>
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
  headerBackground: { width: '100%', height: 200, transform: [{ translateX: -205 }] },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#fff', marginTop: -75 },
  userInfoContainer: { alignItems: 'center', marginTop: 16 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  userRole: { fontSize: 16, color: '#ccc', marginTop: 4 },
  userHandle: { fontSize: 14, color: '#888', marginTop: 4 },
  userIdDebug: { fontSize: 12, color: '#666', marginTop: 2 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingHorizontal: 20 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 25, marginHorizontal: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  followButton: { backgroundColor: '#007BFF' },
  hireButton: { backgroundColor: '#4F46E5' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, borderBottomWidth: 1, borderBottomColor: '#333' },
  tabButton: { paddingHorizontal: 16 },
  tabText: { color: '#888', fontSize: 16, paddingBottom: 12 },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
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
});

export default ProfileScreen;