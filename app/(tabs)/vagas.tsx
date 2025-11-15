import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ImageSourcePropType // Para as imagens locais
    ,


    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color="white" />
    <Text style={styles.modalGoBackText}>Voltar</Text>
  </TouchableOpacity>
);

// --- 4. Componente do Card (Reutilizável) ---
interface JobCardProps {
  item: Vaga;
  onPressInfo: (item: Vaga) => void; // Função para abrir o modal
}

const JobCard: React.FC<JobCardProps> = ({ item, onPressInfo }) => (
  <View style={styles.cardContainer}>
    {/* Imagem (Banner com Logo) */}
    <Image source={item.logoBannerUrl} style={styles.cardImage} />

    {/* Conteúdo de texto */}
    <View style={styles.contentContainer}>
      {/* Linha 1: Título e Botão */}
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity style={styles.propostaButton}>
          <Text style={styles.propostaButtonText}>Enviar proposta</Text>
        </TouchableOpacity>
      </View>

      {/* Linha 2: Timestamp */}
      <Text style={styles.timestamp}>{item.timestamp}</Text>

      {/* Linha 3: Link "mais informações" */}
      <TouchableOpacity style={styles.infoButton} onPress={() => onPressInfo(item)}>
        <Text style={styles.link}>mais informações</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// --- 5. Componente do Modal (NOVO) ---
interface JobDetailModalProps {
  visible: boolean;
  onClose: () => void;
  vaga: Vaga | null;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ visible, onClose, vaga }) => {
  if (!vaga) return null;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Botão "Voltar" */}
        <ModalHeader onClose={onClose} />
        <ScrollView>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{vaga.title}</Text>
            <Text style={styles.modalCompany}>Publicado por: {vaga.companyName}</Text>
            <Text style={styles.modalDescription}>{vaga.description}</Text>
            {/* Sem seção de comentários, como pedido */}
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
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={VAGAS_DATA}
        renderItem={({ item }) => <JobCard item={item} onPressInfo={handleOpenModal} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        // Adiciona um título no topo da lista
        ListHeaderComponent={
          <Text style={styles.pageTitle}>Vagas</Text>
        }
      />

      {/* Renderiza o modal (ele fica escondido até ser ativado) */}
      <JobDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        vaga={selectedVaga}
      />
    </SafeAreaView>
  );
};

// --- 7. Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#333' // Placeholder
  },
  contentContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  propostaButton: {
    backgroundColor: '#007BFF', // Azul
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  propostaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timestamp: {
    fontSize: 14,
    color: '#aaa',
  },
  infoButton: {
    marginTop: 16,
  },
  link: {
    fontSize: 14,
    color: '#A78BFA', // Roxo (do seu tema)
    fontWeight: 'bold',
  },
  
  // --- Estilos do Modal ---
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
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCompany: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
});

export default TrabalhoScreen;