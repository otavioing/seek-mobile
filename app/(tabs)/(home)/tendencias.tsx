import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// --- URLs de Placeholder para as Imagens ---
const foto1 = 'https://i.imgur.com/k6Kx6Qk.png'; // Câmeras
const foto2 = 'https://i.imgur.com/KxS1YQz.png'; // Mão segurando fotos
const logos = 'https://i.imgur.com/w3T9aT6.png'; // Grade de logos
const mario = 'https://i.imgur.com/8Q9jQ8S.png'; // Muro com Mario

const { width } = Dimensions.get('window');

// --- Sub-componente: Informações do Autor ---
// (Reutilizado em ambos os cards)
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
    <View style={styles.authorLogo} />
  </View>
);

// --- Sub-componente: Card Grande (Fotografia) ---
interface cardProps {
  imageUrl: string;
  author: string;
  followers: string;
}
const LargePostCard: React.FC<cardProps> = ({ imageUrl, author, followers }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <AuthorInfo author={author} followers={followers} />
    </View>
  );
};

// --- Sub-componente: Card Pequeno (Modernismo) ---
interface cardProps {
  imageUrl: string;
  author: string;
  followers: string;
}
const SmallPostCard: React.FC<cardProps> = ({ imageUrl, author, followers }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <AuthorInfo author={author} followers={followers} />
    </View>
  );
};

// --- Sub-componente: Carrossel da Seção ---
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

// --- Componente Principal da Tela ---
const TendenciasScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Seção Fotografia */}
        <SectionCarousel title="Fotografia">
          <LargePostCard
            imageUrl={foto1}
            author="Nome autor"
            followers="10000 seguindo"
          />
          <LargePostCard
            imageUrl={foto2}
            author="Outro autor"
            followers="1500 seguindo"
          />
        </SectionCarousel>

        {/* Seção Modernismo */}
        <SectionCarousel title="Modernismo">
          <SmallPostCard
            imageUrl={logos}
            author="Nome autor"
            followers="10000 seguindo"
          />
          <SmallPostCard
            imageUrl={mario}
            author="Street Art"
            followers="7890 seguindo"
          />
          <SmallPostCard
            imageUrl={logos}
            author="Nome autor"
            followers="10000 seguindo"
          />
        </SectionCarousel>

        {/* Seção Ilustração */}
        <SectionCarousel title="Ilustração">
          <LargePostCard
            imageUrl={foto2}
            author="Ilustrador"
            followers="5400 seguindo"
          />
          <LargePostCard
            imageUrl={foto1}
            author="Design Co."
            followers="12000 seguindo"
          />
        </SectionCarousel>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos ---
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
    width: width * 0.89, // 70% da tela
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  cardImage: {
    width: '100%',
    height: 250,
  },
  // Info do Autor
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
});

export default TendenciasScreen;