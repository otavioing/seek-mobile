import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TabName = 'Info' | 'Projetos' | 'Cursos';

// Para o layout da grade de fotos
const { width } = Dimensions.get('window');
const photoSize = (width - 32 - 8) / 2; // 32 de padding (16+16) e 8 de espaço entre

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Info');

  // URLs de placeholder para as imagens
  const headerImageUrl = 'https://i.imgur.com/gYwB4Pz.png'; // Fundo abstrato
  const profileImageUrl = 'https://i.imgur.com/VbS1y2h.png'; // Avatar placeholder
  const churchImageUrl = 'https://i.imgur.com/5Jk1mCj.png'; // Imagem da igreja
  const photo1Url = 'https://i.imgur.com/2b0nZgX.png'; // Foto placeholder 1
  const photo2Url = 'https://i.imgur.com/AEdlSj1.png'; // Foto placeholder 2
  const photo3Url = 'https://i.imgur.com/UATxSxs.png'; // Foto placeholder 3

  // Função para renderizar as abas "Info", "Projetos", "Cursos"
  const renderTabButton = (tabName: TabName) => ( // LINHA NOVA
    <TouchableOpacity
      style={styles.tabButton}
      onPress={() => setActiveTab(tabName)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === tabName && styles.activeTabText,
        ]}
      >
        {tabName}
      </Text>
      {/* Indicador da aba ativa */}
      {activeTab === tabName && <View style={styles.activeTabIndicator} />}
    </TouchableOpacity>
  );

  // Função para renderizar o conteúdo da aba
  const renderTabContent = () => {
    if (activeTab === 'Info') {
      // Como pedido: "uma seção de fotos logo abaixo"
      return (
        <View style={styles.photoGrid}>
          <Image source={{ uri: churchImageUrl }} style={styles.photo} />
          <Image source={{ uri: photo1Url }} style={styles.photo} />
          <Image source={{ uri: photo2Url }} style={styles.photo} />
          <Image source={{ uri: photo3Url }} style={styles.photo} />
        </View>
      );
    }
    if (activeTab === 'Projetos') {
      return <Text style={styles.placeholderText}>Seção de Projetos</Text>;
    }
    if (activeTab === 'Cursos') {
      return <Text style={styles.placeholderText}>Seção de Cursos</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* O ScrollView contém todo o perfil, exceto a barra de navegação inferior */}
      <ScrollView style={styles.scrollContainer}>
        {/* --- Seção Header e Foto de Perfil --- */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={{ uri: headerImageUrl }}
            style={styles.headerBackground}
          />
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
        </View>

        {/* --- Seção de Informações do Usuário --- */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>Nome do usuário</Text>
          <Text style={styles.userRole}>função/cargo/emprego</Text>
          <Text style={styles.userHandle}>@nomedousuário</Text>
        </View>

        {/* --- Seção de Botões --- */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.followButton]}>
            <Text style={styles.buttonText}>Seguir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.hireButton]}>
            <Text style={styles.buttonText}>Contratar</Text>
          </TouchableOpacity>
        </View>

        {/* --- Seção de Abas (Info, Projetos, Cursos) --- */}
        <View style={styles.tabBar}>
          {renderTabButton('Info')}
          {renderTabButton('Projetos')}
          {renderTabButton('Cursos')}
        </View>

        {/* --- Seção de Conteúdo (Fotos) --- */}
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* --- Barra de Navegação Inferior (Fake) --- */}
      {/* Em um app real, isso seria um BottomTabNavigator do React Navigation */}
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Fundo preto principal
  },
  scrollContainer: {
    flex: 1,
  },
  // Header e Foto de Perfil
  headerContainer: {
    alignItems: 'center', // Para centralizar a foto de perfil
  },
  headerBackground: {
    width: '100%',
    height: 150,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Metade da largura/altura para ser um círculo
    borderWidth: 4,
    borderColor: '#fff',
    marginTop: -60, // Puxa a imagem para cima, sobrepondo o header
  },
  // Informações do Usuário
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRole: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  // Botões
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1, // Faz os botões dividirem o espaço
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#007BFF', // Azul
  },
  hireButton: {
    backgroundColor: '#4F46E5', // Roxo/Índigo
  },
  // Abas (Info, Projetos, Cursos)
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Linha sutil de separação
  },
  tabButton: {
    paddingHorizontal: 16,
  },
  tabText: {
    color: '#888', // Cor da aba inativa
    fontSize: 16,
    paddingBottom: 12,
  },
  activeTabText: {
    color: '#fff', // Cor da aba ativa
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    height: 3,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Conteúdo (Seção de Fotos)
  contentContainer: {
    padding: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  // Navegação Inferior
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000', // Garante o fundo preto
  },
});

export default ProfileScreen;