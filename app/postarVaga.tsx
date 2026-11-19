import { jobsApi } from '@/src/services/seek';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PostarVaga() {
  const [title, setTitle] = useState('');
  const [redirectLink, setRedirectLink] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [removeCategoryModalVisible, setRemoveCategoryModalVisible] = useState(false);
  const [categoryToRemove, setCategoryToRemove] = useState('');

  const handleConfirmCategory = () => {
    const nextCategory = categoryInput.trim();

    if (!nextCategory) {
      return;
    }

    setCategories((currentCategories) => [...currentCategories, nextCategory]);
    setCategoryInput('');
    setCategoryModalVisible(false);
  };

  const requestRemoveCategory = (category: string) => {
    setCategoryToRemove(category);
    setRemoveCategoryModalVisible(true);
  };

  const handleConfirmRemoveCategory = () => {
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category !== categoryToRemove),
    );
    setCategoryToRemove('');
    setRemoveCategoryModalVisible(false);
  };

  const handlePublishVacancy = async () => {
    const categoria = categories[0]?.trim() || '';

    if (!title.trim() || !categoria || !/^https?:\/\//i.test(redirectLink.trim()) || !description.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha a categoria, o link e a descrição para continuar.',
      );
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      await jobsApi.create({
        titulo: title.trim(),
        categorias: categories,
        url: redirectLink.trim(),
        descricao: description.trim(),
      });

      setTitle('');
      setRedirectLink('');
      setDescription('');
      setCategories([]);
      setCategoryInput('');
      setCategoryModalVisible(false);
      setRemoveCategoryModalVisible(false);
      setCategoryToRemove('');

      Alert.alert('Vaga publicada', 'Sua vaga foi enviada com sucesso.');
    } catch (error) {
      console.log('Erro ao publicar vaga:', error);

      if (isAxiosError(error)) {
        const serverMsg =
          (typeof error.response?.data === 'string' && error.response?.data.trim()) ||
          error.response?.data?.message ||
          error.response?.data?.mensagem ||
          error.response?.data?.error ||
          error.response?.data?.msg ||
          error.response?.data?.detail;

        if (!error.response) {
          Alert.alert('Sem conexão', 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
        } else if (serverMsg) {
          Alert.alert('Erro ao publicar', String(serverMsg));
        } else {
          Alert.alert('Erro ao publicar', 'Não foi possível publicar agora. Tente novamente.');
        }
      } else {
        Alert.alert('Erro ao publicar', 'Não foi possível publicar agora. Tente novamente.');
      }
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Título da vaga</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Design gráfico"
          placeholderTextColor="#F3F4F6"
          style={styles.titleInput}
        />

        <View style={styles.divider} />

        <Text style={styles.label}>Adicionar link de redirecionamento</Text>
        <TextInput
          value={redirectLink}
          onChangeText={setRedirectLink}
          placeholder="https://..."
          placeholderTextColor="#5F5F5F"
          autoCapitalize="none"
          keyboardType="url"
          style={styles.inputBox}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriesWrap}>
          {categories.length === 0 ? (
            <Text style={styles.emptyCategoriesText}>Nenhuma categoria adicionada</Text>
          ) : (
            categories.map((category, index) => (
              <TouchableOpacity
                key={`${category}-${index}`}
                style={styles.categoryChip}
                activeOpacity={0.8}
                onPress={() => requestRemoveCategory(category)}
              >
                <Text style={styles.categoryChipText}>{category}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        <TouchableOpacity
          style={styles.addCategoryButton}
          activeOpacity={0.85}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.addCategoryIcon}>+</Text>
        </TouchableOpacity>
        <Text style={styles.categoriesHint}>A categoria principal é o texto acima. Os chips abaixo continuam disponíveis para organizar ideias localmente.</Text>

        <View style={styles.spacer} />

        <View style={styles.divider} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.counterText}>{description.length}/500</Text>
        </View>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder=""
          placeholderTextColor="#5F5F5F"
          multiline
          maxLength={500}
          textAlignVertical="top"
          style={styles.descriptionBox}
        />

        <TouchableOpacity style={styles.publishButton} activeOpacity={0.88} onPress={handlePublishVacancy}>
          <Text style={styles.publishButtonText}>Postar vaga</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCategoryModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Adicionar categoria</Text>
            <TextInput
              value={categoryInput}
              onChangeText={setCategoryInput}
              placeholder="Digite a categoria"
              placeholderTextColor="#7A7A7A"
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setCategoryInput('');
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmCategory}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={removeCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRemoveCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setRemoveCategoryModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Remover categoria</Text>
            <Text style={styles.modalMessage}>
              Deseja realmente remover a categoria &quot;{categoryToRemove}&quot; da vaga?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setCategoryToRemove('');
                  setRemoveCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmRemoveButton]}
                onPress={handleConfirmRemoveCategory}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090909',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#090909',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
  },
  titleInput: {
    color: '#F8F8F8',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    padding: 0,
    marginBottom: 22,
  },
  divider: {
    height: 3,
    backgroundColor: '#7D7D7D',
    borderRadius: 999,
    marginBottom: 16,
  },
  label: {
    color: '#F4F4F4',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#F4F4F4',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  counterText: {
    color: '#8A8A8A',
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    backgroundColor: '#141414',
    color: '#F8F8F8',
    borderRadius: 2,
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  addCategoryButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2F6DF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 150,
  },
  categoriesHint: {
    color: '#8A8A8A',
    fontSize: 12,
    lineHeight: 18,
    marginTop: -138,
    marginBottom: 18,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  emptyCategoriesText: {
    color: '#8A8A8A',
    fontSize: 15,
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#141414',
    borderColor: '#2C2C2C',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipText: {
    color: '#F8F8F8',
    fontSize: 14,
    fontWeight: '600',
  },
  addCategoryIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '400',
    marginTop: -2,
  },
  spacer: {
    height: 2,
  },
  descriptionBox: {
    backgroundColor: '#141414',
    color: '#F8F8F8',
    borderRadius: 2,
    minHeight: 184,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  publishButton: {
    marginTop: 24,
    backgroundColor: '#2F6DF6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  modalTitle: {
    color: '#F8F8F8',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalMessage: {
    color: '#D7D7D7',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },
  modalInput: {
    backgroundColor: '#171717',
    color: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#1B1B1B',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  modalConfirmButton: {
    backgroundColor: '#2F6DF6',
  },
  modalConfirmRemoveButton: {
    backgroundColor: '#D64545',
  },
  modalCancelText: {
    color: '#F8F8F8',
    fontSize: 15,
    fontWeight: '700',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
