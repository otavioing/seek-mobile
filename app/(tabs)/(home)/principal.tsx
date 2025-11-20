import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, Image,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet, Text, TouchableOpacity, View,
  ViewStyle
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

interface Comment {
  id: string;
  user: string;
  text: string;
}
interface PostData {
  id: string;
  author: string;
  followers: string;
  imageUrl: ImageSourcePropType;
  likes: number;
  comments: Comment[];
}

const posts: PostData[] = [
  {
    id: '1',
    author: 'Nome autor',
    followers: '10000 seguindo',
    imageUrl: require('@/assets/images/tabsHome/imgT5.jpg'),
    likes: 152,
    comments: [
      { id: 'c1', user: 'Ana', text: 'Que foto incrível!' },
      { id: 'c2', user: 'Marcos', text: 'Adorei as cores.' },
    ],
  },
  {
    id: '2',
    author: 'Outro Artista',
    followers: '2345 seguindo',
    imageUrl: require('@/assets/images/tabsHome/imgT1.jpg'),
    likes: 98,
    comments: [
      { id: 'c3', user: 'Julia', text: 'Onde é isso?' },
    ],
  },
  {
    id: '3',
    author: 'Paisagens Urbanas',
    followers: '7890 seguindo',
    imageUrl: require('@/assets/images/tabsHome/imgT7.jpg'),
    likes: 230,
    comments: [],
  },
];

interface AuthorAvatarProps {
  style?: StyleProp<ViewStyle>;
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
  post: PostData | null;
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
          <Image source={post.imageUrl} style={styles.modalImage} />
          <View style={styles.modalContent}>
            <View style={styles.likesContainer}>
              <Icon name="thumbs-up-outline" size={22} color="#fff" />
              <Text style={styles.likesText}>{post.likes} curtidas</Text>
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
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

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

  const handleMainMenuPress = () => {/* ... */};
  const handleCloseMainMenu = () => {/* ... */};
  const handleUserMenuPress = () => {/* ... */};
  const handleCloseUserMenu = () => {/* ... */};
  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  const openImageModal = (post: PostData) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };
  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.gallery}>
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
        {posts.map((post) => (
          <View key={post.id} style={styles.cardContainer}>
            <TouchableOpacity onPress={() => openImageModal(post)}>
              <Image
                style={styles.galleryImage}
                source={post.imageUrl}
              />
            </TouchableOpacity>
            <View style={styles.cardInfo}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardAuthor}>{post.author}</Text>
                <Text style={styles.cardFollowers}>{post.followers}</Text>
              </View>
              <AuthorAvatar />
            </View>
          </View>
        ))}
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
    paddingBottom:50,
    paddingHorizontal: 16,
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
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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