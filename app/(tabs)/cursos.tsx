import { api } from '@/src/services/api';
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
import Icon from 'react-native-vector-icons/Ionicons';

interface Comment {
  id: string;
  user: string;
  text: string;
}

interface Course {
  id: string;
  title: string;
  author: string;
  price: string;
  duration: string;
  imageUrl: ImageSourcePropType;
  description: string;
  comments: Comment[];
}

interface CourseCardProps {
  item: Course;
  onPressInfo: (item: Course) => void;
  theme: Theme;
}

type Theme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
  commentCard: string;
};

const CourseCard = ({ item, onPressInfo, theme }: CourseCardProps) => (
  <TouchableOpacity onPress={() => onPressInfo(item)} activeOpacity={0.9}>
    <View style={[styles.cardContainer, { backgroundColor: theme.card }]}>
      <View style={styles.imageContainer}>
        <Image source={item.imageUrl} style={styles.cardImage} />
        <View style={[styles.durationTag, { backgroundColor: theme.accent }]}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.price, { color: theme.textPrimary }]}>{item.price}</Text>
        </View>

        <Text style={[styles.author, { color: theme.textSecondary }]}>{item.author}</Text>

        <View style={[styles.row, { marginTop: 16 }]}>
          <Text style={[styles.link, { color: theme.accent }]}>mais informações</Text>

          <TouchableOpacity>
            <Icon name="heart-outline" size={24} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const ModalHeader = ({ onClose, theme }: { onClose: () => void; theme: Theme }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color={theme.textPrimary} />
    <Text style={[styles.modalGoBackText, { color: theme.textPrimary }]}>Voltar</Text>
  </TouchableOpacity>
);

interface CourseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  course: Course | null;
  theme: Theme;
}

const CourseDetailModal = ({ visible, onClose, course, theme }: CourseDetailModalProps) => {
  if (!course) return null;

  const handleSubscribe = async () => {
    const url = 'https://www.alura.com.br/';
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

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ScrollView>
          <ModalHeader onClose={onClose} theme={theme} />

          <Image source={course.imageUrl} style={styles.modalImage} />

          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{course.title}</Text>
            <Text style={[styles.modalAuthor, { color: theme.textSecondary }]}>Por: {course.author}</Text>
            <Text style={[styles.modalDescription, { color: theme.textPrimary }]}>{course.description}</Text>

            <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: theme.accent }]} onPress={handleSubscribe}>
              <Text style={styles.subscribeButtonText}>Assinar</Text>
            </TouchableOpacity>

            <Text style={[styles.commentsTitle, { color: theme.textPrimary, borderTopColor: theme.border }]}>Comentários</Text>

            {course.comments.length === 0 ? (
              <Text style={{ color: theme.textSecondary }}>Sem comentários ainda</Text>
            ) : (
              course.comments.map(comment => (
                <View key={comment.id} style={[styles.commentContainer, { backgroundColor: theme.commentCard }]}>
                  <Text style={[styles.commentUser, { color: theme.textPrimary }]}>{comment.user}</Text>
                  <Text style={[styles.commentText, { color: theme.textSecondary }]}>{comment.text}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const CursosScreen = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const isFocused = useIsFocused();

  const theme: Theme = darkMode
    ? {
        background: '#000000',
        card: '#1a1a1a',
        textPrimary: '#FFFFFF',
        textSecondary: '#AAAAAA',
        accent: '#A78BFA',
        border: '#333333',
        commentCard: '#1a1a1a',
      }
    : {
        background: '#E6E6E6',
        card: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#4A4A4A',
        accent: '#6D28D9',
        border: '#CFCFCF',
        commentCard: '#F3F3F3',
      };

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const fetchCourses = async () => {
    try {
      const response = await api.get('/postscursos');

      const data = response.data.map((item: any) => ({
        id: item.id.toString(),
        title: item.nome_curso,
        author: item.nome_usuario,
        price: item.valor_curso,
        duration: "Sem duração",
        imageUrl: { uri: item.imagem_curso }, // 🔥 imagem da API
        description: item.descricao_curso,
        comments: [], // futuramente pode vir da API
      }));

      setCourses(data);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={courses}
        renderItem={({ item }) => (
          <CourseCard item={item} onPressInfo={handleOpenModal} theme={theme} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Cursos</Text>}
      />

      <CourseDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        course={selectedCourse}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
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
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  durationTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#A78BFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  price: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  author: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  link: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: 'bold',
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
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalAuthor: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 8,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  subscribeButton: {
    marginTop: 20,
    backgroundColor: '#A78BFA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 32,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
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

export default CursosScreen;