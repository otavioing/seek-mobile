import React, { useState } from 'react';
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
  comments: Comment[];
  likes: number;
}
type TabName = 'Postagens' | 'Cursos';

const { width } = Dimensions.get('window');
const photoSize = (width - 32 - 8) / 2;

const postData: Post[] = [
  {
    id: 'p1',
    imageUrl: require('../../assets/images/imgC1.png'),
    comments: [{ id: 'c1', user: 'Ana', text: 'Que foto incrível!' }],
    likes: 152,
  },
  {
    id: 'p2',
    imageUrl: require('../../assets/images/imgC2.png'),
    comments: [{ id: 'c3', user: 'Julia', text: 'Onde é isso?' }],
    likes: 98,
  },
  {
    id: 'p3',
    imageUrl: require('../../assets/images/imgC3.png'),
    comments: [],
    likes: 230,
  },
  {
    id: 'p4',
    imageUrl: require('../../assets/images/imgC4.png'),
    comments: [{ id: 'c4', user: 'Lucas', text: 'Composição perfeita.' }],
    likes: 42,
  },
];


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
  userLogo: ImageSourcePropType;
  userName: string;
}

const PostDetailModal = ({ visible, onClose, post, userLogo, userName }: PostDetailModalProps) => {
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
            <Image source={userLogo} style={styles.modalUserAvatar} />
            <Text style={styles.modalUserName}>{userName}</Text>
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
  const [activeTab, setActiveTab] = useState<TabName>('Postagens');

  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<ImageSourcePropType | null>(null);

  const headerImageUrl = require('../../assets/images/perfil/bannerDenji.jpg');
  const profileImageUrl = require('../../assets/images/perfil/denji.jpg');
  const userName = "Seek";

  const handleOpenPostModal = (post: Post) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };
  const handleClosePostModal = () => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
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
      return (
        <View style={styles.photoGrid}>
          {postData.map((post) => (
            <TouchableOpacity key={post.id} onPress={() => handleOpenPostModal(post)}>
              <Image source={post.imageUrl} style={styles.photo} />
            </TouchableOpacity>
          ))}
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
      <ScrollView style={styles.scrollContainer}>

        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => handleOpenProfileModal(headerImageUrl)}>
            <ImageBackground
              source={headerImageUrl}
              style={styles.headerBackground}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenProfileModal(profileImageUrl)}>
            <Image
              source={profileImageUrl}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>Empresa</Text>
          <Text style={styles.userHandle}>@seeking</Text>
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
        userName={userName}
        userLogo={profileImageUrl}
      />
      <SimpleImageModal
        visible={isProfileModalVisible}
        onClose={handleCloseProfileModal}
        image={selectedProfileImage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  scrollContainer: { flex: 1 },
  headerContainer: { alignItems: 'center' },
  headerBackground: { width: '100%', height: 200, transform: [{ translateX: -205 }] },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#fff', marginTop: -75 },
  userInfoContainer: { alignItems: 'center', marginTop: 16 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  userRole: { fontSize: 16, color: '#ccc', marginTop: 4 },
  userHandle: { fontSize: 14, color: '#888', marginTop: 4 },
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