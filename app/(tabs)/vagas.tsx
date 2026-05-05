import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Importe o ícone para o botão "Voltar"
import Icon from 'react-native-vector-icons/Ionicons';

// --- 1. Definição do Tipo de Dados ---
interface Vaga {
  id: string;
  title: string;
  companyName: string;
  logoBannerUrl: ImageSourcePropType; // Banner com a logo
  timestamp: string;
  description: string;
}

type Theme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  link: string;
  border: string;
  imagePlaceholder: string;
  modalBackground: string;
};

// --- 2. Dados Fictícios (Mock Data) ---
// (Usei o 'require' para as imagens locais, como no seu perfil)
const VAGAS_DATA: Vaga[] = [
  {
    id: '1',
    title: 'Designer',
    companyName: 'Seek',
    logoBannerUrl: require('../../assets/images/imgC1.png'), // Ajuste o caminho
    timestamp: '11 horas atrás',
    description: 'Estamos procurando um Designer talentoso para se juntar à nossa equipe. Você será responsável por criar visuais incríveis para nossa plataforma, desde o UI/UX até materiais de marketing.'
  },
  {
    id: '2',
    title: 'Designer',
    companyName: 'Seek',
    logoBannerUrl: require('../../assets/images/imgC2.png'), // Ajuste o caminho
    timestamp: '11 horas atrás',
    description: 'Descrição da segunda vaga de Designer, com foco em mídias sociais e branding.'
  },
  {
    id: '3',
    title: 'Designer',
    companyName: 'Seek',
    logoBannerUrl: require('../../assets/images/imgC3.png'), // Ajuste o caminho
    timestamp: '11 horas atrás',
    description: 'Terceira vaga de Designer, especializada em Motion Graphics e animação 2D.'
  },
];

// --- 3. Componente de Header do Modal (Reutilizado) ---
const ModalHeader = ({ onClose, theme }: { onClose: () => void; theme: Theme }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color={theme.textPrimary} />
    <Text style={[styles.modalGoBackText, { color: theme.textPrimary }]}>Voltar</Text>
  </TouchableOpacity>
);

// --- 4. Componente do Card (Reutilizável) ---
interface JobCardProps {
  item: Vaga;
  onPressInfo: (item: Vaga) => void; // Função para abrir o modal
  theme: Theme;
}

const openApplicationLink = async () => {
  const url = 'https://www.linkedin.com/';
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Não foi possível abrir o link', url);
    }
  } catch (e) {
    Alert.alert('Erro ao abrir o link', 'Tente novamente.');
  }
};

const JobCard: React.FC<JobCardProps> = ({ item, onPressInfo, theme }) => (
  <View style={[styles.cardContainer, { backgroundColor: theme.card }] }>
    {/* Imagem (Banner com Logo) */}
    <Image source={item.logoBannerUrl} style={[styles.cardImage, { backgroundColor: theme.imagePlaceholder }]} />

    {/* Conteúdo de texto */}
    <View style={[styles.contentContainer, { borderTopColor: theme.border }]}>
      {/* Linha 1: Título e Botão */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.timestamp, { color: theme.textMuted }]}>{item.timestamp}</Text>
        </View>

        <TouchableOpacity
          style={[styles.propostaButton, { backgroundColor: '#1E90FF' }]}
          onPress={openApplicationLink}
        >
          <Text style={styles.propostaButtonText}>Inscrição</Text>
        </TouchableOpacity>
      </View>

      {/* "mais informações" centralizado */}
      <TouchableOpacity style={styles.infoButton} onPress={() => onPressInfo(item)}>
        <Text style={[styles.link, { color: theme.link }]}>mais informações</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// --- 5. Componente do Modal (NOVO) ---
interface JobDetailModalProps {
  visible: boolean;
  onClose: () => void;
  vaga: Vaga | null;
  theme: Theme;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ visible, onClose, vaga, theme }) => {
  if (!vaga) return null;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
        {/* Botão "Voltar" */}
        <ModalHeader onClose={onClose} theme={theme} />
        <ScrollView>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{vaga.title}</Text>
            <Text style={[styles.modalCompany, { color: theme.textMuted, borderBottomColor: theme.border }]}>Publicado por: {vaga.companyName}</Text>
            <Text style={[styles.modalDescription, { color: theme.textPrimary }]}>{vaga.description}</Text>

            {/* botão agora igual ao de Proposta */}
            <TouchableOpacity
              style={[styles.propostaButton, styles.modalApplyButton, { backgroundColor: '#1E90FF' }]}
              onPress={openApplicationLink}
            >
              <Text style={styles.propostaButtonText}>Enviar proposta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};


// --- 6. Componente da Tela Principal ---
const TrabalhoScreen = () => {
  // Estado para controlar o modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const isFocused = useIsFocused();

  const theme: Theme = darkMode
    ? {
        background: '#000000',
        card: '#1a1a1a',
        textPrimary: '#FFFFFF',
        textSecondary: '#CCCCCC',
        textMuted: '#AAAAAA',
        link: '#A78BFA',
        border: '#333333',
        imagePlaceholder: '#333333',
        modalBackground: '#000000',
      }
    : {
        background: '#E6E6E6',
        card: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#333333',
        textMuted: '#666666',
        link: '#6D28D9',
        border: '#D1D5DB',
        imagePlaceholder: '#D1D5DB',
        modalBackground: '#E6E6E6',
      };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('tema');
        setDarkMode(savedTheme === 'escuro');
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };

    if (isFocused) {
      loadTheme();
    }
  }, [isFocused]);

  // Funções para abrir/fechar o modal
  const handleOpenModal = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedVaga(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={VAGAS_DATA}
        renderItem={({ item }) => <JobCard item={item} onPressInfo={handleOpenModal} theme={theme} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        style={{ backgroundColor: theme.background }}
        // Adiciona um título no topo da lista
        ListHeaderComponent={
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Vagas</Text>
        }
      />

      {/* Renderiza o modal (ele fica escondido até ser ativado) */}
      <JobDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        vaga={selectedVaga}
        theme={theme}
      />
    </SafeAreaView>
  );
};

// --- 7. Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  // card
  cardContainer: {
    borderRadius: 14,
    marginBottom: 18,
    overflow: 'hidden',
    // sombra leve para Android/iOS
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  propostaButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  propostaButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  timestamp: {
    fontSize: 13,
    color: '#999',
  },

  infoButton: {
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },

  // --- Estilos do Modal ---
  modalContainer: {
    flex: 1,
  },
  modalGoBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalGoBackText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  modalCompany: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalApplyButton: {
    marginTop: 20,
    alignSelf: 'flex-end',
  },
});

export default TrabalhoScreen;