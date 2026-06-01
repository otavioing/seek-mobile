import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Importe o ícone para o botão "Voltar"
import Icon from 'react-native-vector-icons/Ionicons';
import { api } from '../../src/services/api';
import { AppTheme, getAppTheme } from '../../src/theme/appTheme';

// --- 1. Definição do Tipo de Dados ---
interface Vaga {
  id: string;
  category: string;
  title: string;
  authorName: string;
  location: string;
  timestamp: string;
  description: string;
  linkOriginal: string;
}

type ApiVaga = {
  id: number;
  titulo: string;
  empresa: string | null;
  localizacao: string | null;
  descricao: string;
  link_original: string | null;
  criado_em: string;
  nome: string | null;
  foto_perfil: string | null;
  nome_categoria: string | null;
};

// --- 3. Componente do Card (Reutilizável) ---
interface JobCardProps {
  item: Vaga;
  theme: AppTheme;
}

const openApplicationLink = async (url?: string | null) => {
  if (!url) {
    Alert.alert('Link indisponível', 'Esta vaga não possui link para abrir.');
    return;
  }

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

const formatTimeAgo = (dateString?: string | null) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `Há ${Math.max(1, diffMinutes)} min`;
  }

  if (diffHours < 24) {
    return `Há ${diffHours} horas`;
  }

  return `Há ${diffDays} dias`;
};

const JobCard: React.FC<JobCardProps> = ({ item, theme }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.cardContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => openApplicationLink(item.linkOriginal)}
  >
    <View style={styles.cardTopRow}>
      <View style={[styles.categoryBadge, { borderColor: theme.border }]}>
        <Text style={[styles.categoryBadgeText, { color: theme.textMuted }]}>{item.category}</Text>
      </View>
      <Text style={[styles.timestamp, { color: theme.textMuted }]}>{item.timestamp}</Text>
    </View>

    <Text style={[styles.cardTitle, { color: theme.link }]} numberOfLines={1}>
      {item.title}
    </Text>

    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Icon name="person-circle-outline" size={18} color={theme.textPrimary} />
        <Text style={[styles.metaText, { color: theme.textPrimary }]} numberOfLines={1}>{item.authorName}</Text>
      </View>
      <View style={styles.metaItemRight}>
        <Icon name="location-outline" size={18} color={theme.textMuted} />
        <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>{item.location}</Text>
      </View>
    </View>

    <Text style={[styles.description, { color: theme.textPrimary }]} numberOfLines={4}>
      {item.description}
    </Text>
  </TouchableOpacity>
);


// --- 6. Componente da Tela Principal ---
const TrabalhoScreen = () => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isFocused = useIsFocused();

  const theme = getAppTheme(darkMode);

  const carregarVagas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/postsvagas');
      const lista = Array.isArray(data) ? data : [];

      setVagas(
        lista.map((item: ApiVaga) => ({
          id: String(item.id),
          category: item.nome_categoria || 'Sem categoria',
          title: item.titulo || 'Vaga sem título',
          authorName: item.nome || item.empresa || 'Nome do autor',
          location: item.localizacao || 'Localização não informada',
          timestamp: formatTimeAgo(item.criado_em),
          description: item.descricao || '',
          linkOriginal: item.link_original || '',
        })),
      );
    } catch (error) {
      console.log('Erro ao carregar vagas:', error);
      setVagas([]);
      Alert.alert('Erro', 'Não foi possível carregar as vagas no momento.');
    } finally {
      setLoading(false);
    }
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
      void carregarVagas();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={vagas}
        renderItem={({ item }) => <JobCard item={item} theme={theme} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        style={{ backgroundColor: theme.background }}
        // Adiciona um título no topo da lista
        ListHeaderComponent={
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Vagas</Text>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={theme.textPrimary} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>Carregando vagas...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="briefcase-outline" size={56} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>Nenhuma vaga encontrada.</Text>
            </View>
          )
        }
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
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 16,
  },

  // card
  cardContainer: {
    borderRadius: 12,
    marginBottom: 18,
    overflow: 'hidden',
    padding: 14,
    borderWidth: 1,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  metaItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    flexShrink: 1,
  },
  locationText: {
    fontSize: 14,
    flexShrink: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  salaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TrabalhoScreen;