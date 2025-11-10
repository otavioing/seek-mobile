import React from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

// --- DEFINIÇÕES DE TIPO (para este arquivo) ---
interface PostData {
  id: string;
  author: string;
  followers: string;
  imageUrl: ImageSourcePropType;
}

// --- DADOS FICTÍCIOS (para esta tela) ---
// Avatares para o carrossel
const followingStories = [
  { id: '1', name: 'user1' },
  { id: '2', name: 'user2' },
  { id: '3', name: 'user3' },
  { id: '4', name: 'user4' },
  { id: '5', name: 'user5' },
  { id: '6', name: 'user6' },
];

// Posts para o feed (use seus paths de imagem)
const posts: PostData[] = [
  {
    id: '1',
    author: 'Nome autor',
    followers: '10000 seguindo',
    imageUrl: require('@/assets/images/imgTeste.png'), // Use suas imagens
  },
  {
    id: '2',
    author: 'Outro Artista',
    followers: '2345 seguindo',
    imageUrl: require('@/assets/images/imgTeste2.png'),
  },
];

interface AuthorAvatarProps {
  style?: StyleProp<ViewStyle>;
  isStory?: boolean;
}
const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ style, isStory }) => (
  <View style={[styles.avatar, isStory ? styles.storyAvatar : null, style]} />
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

const SeguindoScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {followingStories.map(story => (
              <View key={story.id} style={styles.story}>
                <AuthorAvatar isStory={true} />
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.feedContainer}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storiesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  story: {
    marginRight: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: '#405DE6', 
    borderWidth: 3,
  },
  feedContainer: {
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  galleryImage: {
    width: '100%',
    height: 350, 
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
});

export default SeguindoScreen;