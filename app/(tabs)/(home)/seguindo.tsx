import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text, // 1. Importações de Modal e Animação
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- 2. DEFINIÇÕES DE TIPO ATUALIZADAS ---
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
// Nova interface para os Stories
interface Story {
  id: string;
  user: string;
  storyImage: ImageSourcePropType;
}

// --- 3. DADOS FICTÍCIOS ATUALIZADOS ---
const denjiAvatar = require('@/assets/images/perfil/denji.jpg');

// Avatares para o carrossel (agora com imagens de story)
const followingStories: Story[] = [
  { id: '1', user: 'user1', storyImage: require('@/assets/images/tabsHome/imgT1.jpg') },
  { id: '2', user: 'user2', storyImage: require('@/assets/images/tabsHome/imgT2.jpg') },
  { id: '3', user: 'user3', storyImage: require('@/assets/images/tabsHome/imgT3.jpg') },
  { id: '4_1', user: 'user4', storyImage: require('@/assets/images/tabsHome/imgT4.jpg') },
  { id: '5', user: 'user5', storyImage: require('@/assets/images/tabsHome/imgT5.jpg') },
  { id: '6', user: 'user6', storyImage: require('@/assets/images/tabsHome/imgT6.jpg') },
  { id: '7', user: 'user7', storyImage: require('@/assets/images/tabsHome/imgT7.jpg') },
];

// Posts para o feed (T1 a T7)
const posts: PostData[] = [
  // ... (seus 7 posts, sem alteração)
  { id: '1', author: 'Nome autor', followers: '10000 seguindo', imageUrl: require('@/assets/images/tabsHome/imgT1.jpg'), likes: 138, comments: [{ id: 'c1', user: 'Marcos', text: 'Adorei as cores.' }], },
  { id: '2', author: 'Outro Artista', followers: '2345 seguindo', imageUrl: require('@/assets/images/tabsHome/imgT2.jpg'), likes: 204, comments: [{ id: 'c2', user: 'Ana', text: 'Que foto incrível!' }], },
  { id: '3', author: 'Fotografia BR', followers: '5000 seguindo', imageUrl: require('@/assets/images/tabsHome/imgT3.jpg'), likes: 301, comments: [{ id: 'c3', user: 'Julia', text: 'Abstrato!' }], },
  { id: '4', author: 'Street Art', followers: '7890 seguindo', imageUrl: require('@/assets/images/tabsHome/imgT4.jpg'), likes: 89, comments: [], },
  { id: '5', author: 'Estúdio Criativo', followers: '12k seguindo', imageUrl: require('@/assets/images/tabsHome/imgT5.jpg'), likes: 450, comments: [], },
  { id: '6', author: 'Formas & Cores', followers: '9800 seguindo', imageUrl: require('@/assets/images/tabsHome/imgT6.jpg'), likes: 210, comments: [{ id: 'c4', user: 'Leo', text: 'Incrível.' }], },
  { id: '7', author: 'Ilustrador Digital', followers: '8200 seguindo', imageUrl: require('@/assets/images/tabsHome/imgT7.jpg'), likes: 720, comments: [{ id: 'c5', user: 'Sara', text: 'Amei o traço.' }], },
];


// --- 4. COMPONENTES DO MODAL DE POST (Sem alteração) ---
const { width } = Dimensions.get('window');

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color="white" />
    <Text style={styles.modalGoBackText}>Voltar</Text>
  </TouchableOpacity>
);

interface PostDetailModalProps { /* ... */ }
const PostDetailModal = ({ visible, onClose, post }: PostDetailModalProps) => {
  // ... (seu modal de post, sem alteração)
  if (!post) return null;
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <ModalHeader onClose={onClose} />
          <View style={styles.modalHeader}>
            <Image source={denjiAvatar} style={styles.modalUserAvatar} />
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


// --- 5. COMPONENTE DO STORY MODAL (NOVO) ---
interface StoryModalProps {
  visible: boolean;
  onClose: () => void;
  story: Story | null;
}

const StoryModal = ({ visible, onClose, story }: StoryModalProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reseta a animação
      progressAnim.setValue(0);
      // Inicia a animação de 5 segundos
      Animated.timing(progressAnim, {
        toValue: 1, // Anima de 0 para 1
        duration: 5000, // 5 segundos
        useNativeDriver: false, // 'width' não suporta useNativeDriver
      }).start(({ finished }) => {
        // Se a animação terminar (não for interrompida), fecha o modal
        if (finished) {
          onClose();
        }
      });
    } else {
      // Para a animação se o modal for fechado manualmente
      Animated.timing(progressAnim).stop();
    }
  }, [visible, story]);

  // Interpola o valor (0 a 1) para uma largura em porcentagem (0% a 100%)
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!story) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.storyModalContainer}>
        {/* Tocar em qualquer lugar fecha o modal */}
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1}>
          {/* Barra de Progresso */}
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
          </View>
          
          {/* Header do Story */}
          <View style={styles.storyModalHeader}>
            <Image source={denjiAvatar} style={styles.storyModalAvatar} />
            <Text style={styles.storyModalUser}>{story.user}</Text>
            <TouchableOpacity onPress={onClose} style={styles.storyCloseButton}>
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Imagem do Story */}
          <Image
            source={story.storyImage}
            style={styles.storyModalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};


// --- 6. COMPONENTES DO CARD (Sem alteração) ---
interface AuthorAvatarProps {
  style?: StyleProp<ViewStyle>;
  isStory?: boolean;
}
const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ style, isStory }) => (
  <Image source={denjiAvatar} style={[styles.avatar, isStory ? styles.storyAvatar : null, style]} />
);

const PostCard = ({ post }: { post: PostData }) => (
  <View style={styles.cardContainer}>
    <Image source={post.imageUrl} style={styles.galleryImage} />
    <View style={styles.cardInfo}>
      <View>
        <Text style={styles.cardAuthor}>{post.author}</Text>
        <Text style={styles.cardFollowers}>{post.followers}</Text>
      </View>
      <AuthorAvatar />
    </View>
  </View>
);


// --- 7. TELA PRINCIPAL (ATUALIZADA) ---
const SeguindoScreen = () => {
  // Estado para o modal de POST
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  // Estado para o modal de STORY
  const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Funções do Modal de Post
  const handleOpenPostModal = (post: PostData) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };
  const handleClosePostModal = () => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
  };

  // Funções do Modal de Story
  const handleOpenStoryModal = (story: Story) => {
    setSelectedStory(story);
    setIsStoryModalVisible(true);
  };
  const handleCloseStoryModal = () => {
    setIsStoryModalVisible(false);
    setSelectedStory(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Carrossel de Stories (AGORA CLICÁVEL) */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {followingStories.map(story => (
              <TouchableOpacity key={story.id} onPress={() => handleOpenStoryModal(story)}>
                <View style={styles.story}>
                  <AuthorAvatar isStory={true} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Feed de Posts (AGORA CLICÁVEL) */}
        <View style={styles.feedContainer}>
          {posts.map((post) => (
            <TouchableOpacity key={post.id} onPress={() => handleOpenPostModal(post)}>
              <PostCard post={post} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Renderiza o modal de Post */}
      <PostDetailModal
        visible={isPostModalVisible}
        onClose={handleClosePostModal}
        post={selectedPost}
      />
      {/* Renderiza o modal de Story */}
      <StoryModal
        visible={isStoryModalVisible}
        onClose={handleCloseStoryModal}
        story={selectedStory}
      />
    </View>
  );
};

// --- 8. ESTILOS (ATUALIZADOS) ---
const styles = StyleSheet.create({
  // ... (seus estilos de .container até .cardFollowers)
  container: { flex: 1, backgroundColor: '#000' },
  storiesContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  story: { marginRight: 16, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#555' },
  storyAvatar: { width: 64, height: 64, borderRadius: 32, borderColor: '#405DE6', borderWidth: 3 },
  feedContainer: { padding: 16 },
  cardContainer: { backgroundColor: '#1a1a1a', borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  galleryImage: { width: '100%', height: 350 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  cardAuthor: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cardFollowers: { color: '#888', fontSize: 12 },

  // ... (seus estilos de .modalContainer até .commentText)
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalGoBack: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  modalGoBackText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  modalUserAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#555', marginRight: 12 },
  modalUserName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalImage: { width: '100%', height: width, resizeMode: 'cover', marginTop: 12 },
  modalContent: { padding: 20 },
  likesContainer: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  likesText: { color: '#fff', fontSize: 16, marginLeft: 10 },
  commentsTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  commentContainer: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 12 },
  commentUser: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  commentText: { fontSize: 14, color: '#ddd' },

  // --- NOVOS ESTILOS PARA O STORY MODAL ---
  storyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)', // Fundo escuro
  },
  progressBarContainer: {
    height: 3,
    width: '95%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storyModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storyModalUser: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  storyCloseButton: {
    marginLeft: 'auto', // Joga o 'X' para a direita
  },
  storyModalImage: {
    flex: 1, // Ocupa o espaço restante
    width: '100%',
    height: 'auto',
  },
});

export default SeguindoScreen;