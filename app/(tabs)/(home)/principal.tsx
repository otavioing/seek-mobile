import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, Image,
  ImageStyle,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet, Text, TouchableOpacity, View,
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
  style?: StyleProp<ImageStyle>;
}

const denjiAvatar = require('@/assets/images/perfil/denji.jpg');

const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ style }) => (
  <Image source={denjiAvatar} style={[styles.avatar, style]} />
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
  if (!post) return null;

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
            <AuthorAvatar style={styles.modalUserAvatar} />
            <Text style={styles.modalUserName}>{post.author}</Text>
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


export default function HomeScreen() {
  const [isMainMenuVisible, setIsMainMenuVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const { posts } = usePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const userMenuOverlayOpacity = useRef(new Animated.Value(0)).current;
  const userMenuPosition = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const mainMenuOverlayOpacity = useRef(new Animated.Value(0)).current;
  const mainMenuPosition = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (isUserMenuVisible) {
      Animated.parallel([
        Animated.timing(userMenuOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(userMenuPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (isMainMenuVisible) {
      Animated.parallel([
        Animated.timing(mainMenuOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainMenuPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isUserMenuVisible, isMainMenuVisible]);

  const handleMainMenuPress = () => {/* ... */ };
  const handleCloseMainMenu = () => {/* ... */ };
  const handleUserMenuPress = () => {/* ... */ };
  const handleCloseUserMenu = () => {/* ... */ };
  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  const openImageModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };
  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.gallery}
        contentContainerStyle={styles.galleryContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={["#000"]}
            progressBackgroundColor="#fff"
          />
        }
      >
        {/* <View style={styles.divCategorias}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}>
            <Text style={styles.categorias}>Para você</Text>
            <Text style={styles.categorias}>Ruas</Text>
            <Text style={styles.categorias}>Arte digital</Text>
            <Text style={styles.categorias}>Modernismo</Text>
            <Text style={styles.categorias}>Paisagem</Text>
            <Text style={styles.categorias}>Abstrato</Text>
            <Text style={styles.categorias}>Retratos</Text>
          </ScrollView>
        </View> */}
        {posts.map((post) => {
          const cover = post.images[0];
          return (
            <View key={post.id} style={styles.cardContainer}>
              <TouchableOpacity onPress={() => openImageModal(post)}>
                <Image
                  style={styles.galleryImage}
                  source={cover}
                />
              </TouchableOpacity>
              <View style={styles.cardInfo}>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardAuthor}>{post.author}</Text>
                  <Text style={styles.cardFollowers}>{post.followers}</Text>
                </View>
                <Text style={styles.timeText}>{formatRelativeTime(post.postedAt)}</Text>
                <AuthorAvatar />
              </View>
              {post.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>{post.description}</Text>
              ) : null}
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