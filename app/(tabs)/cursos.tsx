import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { api } from '@/src/services/api';

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
}

const CourseCard = ({ item, onPressInfo }: CourseCardProps) => (
  <View style={styles.cardContainer}>
    <View style={styles.imageContainer}>
      <Image source={item.imageUrl} style={styles.cardImage} />
      <View style={styles.durationTag}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
    </View>

    <View style={styles.contentContainer}>
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>

      <Text style={styles.author}>{item.author}</Text>

      <View style={[styles.row, { marginTop: 16 }]}>
        <TouchableOpacity onPress={() => onPressInfo(item)}>
          <Text style={styles.link}>mais informações</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Icon name="heart-outline" size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <TouchableOpacity style={styles.modalGoBack} onPress={onClose}>
    <Icon name="arrow-back-outline" size={28} color="white" />
    <Text style={styles.modalGoBackText}>Voltar</Text>
  </TouchableOpacity>
);

interface CourseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  course: Course | null;
}

const CourseDetailModal = ({ visible, onClose, course }: CourseDetailModalProps) => {
  if (!course) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <ModalHeader onClose={onClose} />

          <Image source={course.imageUrl} style={styles.modalImage} />

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{course.title}</Text>
            <Text style={styles.modalAuthor}>Por: {course.author}</Text>
            <Text style={styles.modalDescription}>{course.description}</Text>

            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeButtonText}>Assinar</Text>
            </TouchableOpacity>

            <Text style={styles.commentsTitle}>Comentários</Text>

            {course.comments.length === 0 ? (
              <Text style={{ color: '#999' }}>Sem comentários ainda</Text>
            ) : (
              course.comments.map(comment => (
                <View key={comment.id} style={styles.commentContainer}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
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

  useEffect(() => {
    fetchCourses();
  }, []);

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
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={courses}
        renderItem={({ item }) => (
          <CourseCard item={item} onPressInfo={handleOpenModal} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.pageTitle}>Cursos</Text>}
      />

      <CourseDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        course={selectedCourse}
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