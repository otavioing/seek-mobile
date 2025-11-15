import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ImageSourcePropType,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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

const MOCK_DATA: Course[] = [
  {
    id: '1',
    title: 'Design Gráfico: Fundamentos',
    author: 'José Antonio',
    price: 'R$23,00/mês',
    duration: '48horas',
    imageUrl: require('../../assets/images/imgC1.png'),
    description: 'Aprenda os fundamentos do design gráfico, desde a teoria das cores até a tipografia avançada. Este curso cobre Photoshop, Illustrator e Figma.',
    comments: [
      { id: 'c1', user: 'Ana P.', text: 'Curso excelente, aprendi muito sobre tipografia!' },
      { id: 'c2', user: 'Bruno S.', text: 'O professor explica muito bem, recomendo.' },
    ],
  },
  {
    id: '2',
    title: 'Fotografia Urbana Noturna',
    author: 'Maria Clara',
    price: 'R$19,90/mês',
    duration: '32horas',
    imageUrl: require('../../assets/images/imgC2.png'),
    description: 'Explore a cidade com sua câmera. Este curso foca em composição, longa exposição e como capturar a essência da vida urbana após o pôr do sol.',
    comments: [
      { id: 'c3', user: 'Carla D.', text: 'As dicas de ISO foram salvadoras.' },
      { id: 'c4', user: 'Marcos', text: 'Ótimo para iniciantes.' },
    ],
  },
  {
    id: '3',
    title: 'Ilustração Digital com Procreate',
    author: 'Carlos Eduardo',
    price: 'R$25,00/mês',
    duration: '50horas',
    imageUrl: require('../../assets/images/imgC3.png'),
    description: 'Domine o Procreate no iPad. Aprenda a criar ilustrações digitais complexas, desde o esboço inicial até a arte-final profissional.',
    comments: [
      { id: 'c5', user: 'Julia M.', text: 'Melhor curso de Procreate que já fiz.' },
    ],
  },
  {
    id: '4',
    title: 'Curso de UI/UX Design',
    author: 'Ana Beatriz',
    price: 'R$29,90/mês',
    duration: '60horas',
    imageUrl: require('../../assets/images/imgC4.png'),
    description: 'Foco em design de interfaces e experiência do usuário. Crie protótipos interativos e aprenda a pensar como um designer de produto.',
    comments: [
      { id: 'c6', user: 'Pedro H.', text: 'Conteúdo muito atualizado.' },
      { id: 'c7', user: 'Lucas', text: 'A parte de prototipagem é incrível.' },
      { id: 'c8', user: 'Fernanda', text: 'Vale cada centavo.' },
    ],
  },
];

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

interface CourseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  course: Course | null;
}

const CourseDetailModal = ({ visible, onClose, course }: CourseDetailModalProps) => {
  if (!course) return null;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-circle" size={36} color="white" />
          </TouchableOpacity>

          <Image source={course.imageUrl} style={styles.modalImage} />

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{course.title}</Text>
            <Text style={styles.modalAuthor}>Por: {course.author}</Text>
            <Text style={styles.modalDescription}>{course.description}</Text>

            <Text style={styles.commentsTitle}>Comentários</Text>
            {course.comments.map(comment => (
              <View key={comment.id} style={styles.commentContainer}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const CursosScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
        data={MOCK_DATA}
        renderItem={({ item }) => <CourseCard item={item} onPressInfo={handleOpenModal} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.pageTitle}>Cursos</Text>
        }
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
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