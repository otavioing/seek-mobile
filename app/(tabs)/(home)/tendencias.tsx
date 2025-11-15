import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Comment {
  id: string;
  user: string;
  text: string;
}

interface Post {
  id: string;
  imageUrl: ImageSourcePropType;
  author: string;
  followers: string;
  likes: number;
  comments: Comment[];
}

const denjiAvatar = require('../../../assets/images/perfil/denji.jpg');

const foto1Post: Post = {
  id: 'f1',
  imageUrl: require('../../../assets/images/tabsHome/imgT1.jpg'),
  author: 'Nome autor',
  followers: '10000 seguindo',
  likes: 138,
  comments: [{ id: 'c1', user: 'Marcos', text: 'Adorei as cores.' }],
};

const foto2Post: Post = {
  id: 'f2',
  imageUrl: require('../../../assets/images/tabsHome/imgT2.jpg'),
  author: 'Outro autor',
  followers: '1500 seguindo',
  likes: 204,
  comments: [{ id: 'c2', user: 'Ana', text: 'Que foto incrível!' }],
};

const modPost1: Post = {
  id: 'm1',
  imageUrl: require('../../../assets/images/tabsHome/imgT3.jpg'), // <-- TROCAR
  author: 'Artista Moderno 1',
  followers: '5000 seguindo',
  likes: 301,
  comments: [{ id: 'c3', user: 'Julia', text: 'Abstrato!' }],
};
const modPost2: Post = {
  id: 'm2',
  imageUrl: require('../../../assets/images/tabsHome/imgT4.jpg'), // <-- TROCAR
  author: 'Estúdio Criativo',
  followers: '12k seguindo',
  likes: 450,
  comments: [],
};
const modPost3: Post = {
  id: 'm3',
  imageUrl: require('../../../assets/images/tabsHome/imgT5.jpg'), // <-- TROCAR
  author: 'Formas & Cores',
  followers: '9800 seguindo',
  likes: 210,
  comments: [{ id: 'c4', user: 'Leo', text: 'Incrível.' }],
};

const iluPost1: Post = {
  id: 'i1',
  imageUrl: require('../../../assets/images/tabsHome/imgT6.jpg'), // <-- TROCAR
  author: 'Ilustrador Digital',
  followers: '8200 seguindo',
  likes: 720,
  comments: [{ id: 'c5', user: 'Sara', text: 'Amei o traço.' }],
};
const iluPost2: Post = {
  id: 'i2',
  imageUrl: require('../../../assets/images/tabsHome/imgT7.jpg'), // <-- TROCAR
  author: 'Rascunhos S.A.',
  followers: '3100 seguindo',
  likes: 190,
  comments: [],
};


const { width } = Dimensions.get('window');

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
            <Image source={denjiAvatar} style={styles.authorLogo} />
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

interface AuthorInfoProps {
  author: string;
  followers: string;
}
const AuthorInfo: React.FC<AuthorInfoProps> = ({ author, followers }) => (
  <View style={styles.authorInfo}>
    <View>
      <Text style={styles.authorName}>{author}</Text>
      <Text style={styles.authorFollowers}>{followers}</Text>
    </View>
    <Image source={denjiAvatar} style={styles.authorLogo} />
  </View>
);

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
  style?: any;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPress, style }) => {
  return (
    <TouchableOpacity onPress={() => onPress(post)}>
      <View style={[styles.card, style]}>
        <Image source={post.imageUrl} style={styles.cardImage} />
        <AuthorInfo author={post.author} followers={post.followers} />
      </View>
    </TouchableOpacity>
  );
};

interface SectionCarouselProps {
  title: string;
  children: React.ReactNode;
}
const SectionCarousel: React.FC<SectionCarouselProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContainer}
    >
      {children}
    </ScrollView>
  </View>
);

const TendenciasScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleOpenModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <SectionCarousel title="Fotografia">
          <PostCard post={foto1Post} onPress={handleOpenModal} style={styles.largeCard} />
          <PostCard post={foto2Post} onPress={handleOpenModal} style={styles.largeCard} />
        </SectionCarousel>

        <SectionCarousel title="Modernismo">
          <PostCard post={modPost1} onPress={handleOpenModal} style={styles.smallCard} />
          <PostCard post={modPost2} onPress={handleOpenModal} style={styles.smallCard} />
          <PostCard post={modPost3} onPress={handleOpenModal} style={styles.smallCard} />
        </SectionCarousel>

        <SectionCarousel title="Ilustração">
          <PostCard post={iluPost1} onPress={handleOpenModal} style={styles.largeCard} />
          <PostCard post={iluPost2} onPress={handleOpenModal} style={styles.largeCard} />
        </SectionCarousel>
      </ScrollView>

      <PostDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        post={selectedPost}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 16,
  },
  carouselContainer: {
    paddingLeft: 16,
  },
  card: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  largeCard: {
    width: width * 0.7,
  },
  smallCard: {
    width: width * 0.45,
  },
  cardImage: {
    width: '100%',
    height: 250,
  },
  authorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  authorName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  authorFollowers: {
    color: '#888',
    fontSize: 12,
  },
  authorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    borderWidth: 2,
    borderColor: '#fff',
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
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
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
});

export default TendenciasScreen;