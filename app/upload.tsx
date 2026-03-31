import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePosts } from '../src/context/PostsContext';
import { api } from '../src/services/api';

interface DraftImage {
  uri: string;
}

type Category = { id: string; name: string };

export default function UploadScreen() {
  const router = useRouter();
  const { addPost } = usePosts();
  const [drafts, setDrafts] = useState<DraftImage[]>([]);
  const [title, setTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await api.get('/tendencias');
        const mapped: Category[] = (data || [])
          .map((item: any) => ({
            id: String(item.id_categoria ?? item.id ?? item.value ?? ''),
            name: item.nome_categoria || item.nome || item.categoria || '',
          }))
          .filter((c: Category) => c.id && c.name);
        setCategories(mapped);
      } catch (error) {
        console.log('Erro ao carregar categorias', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para publicar.');
      return false;
    }
    return true;
  };

  const handlePickImages = async () => {
    const ok = await requestPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 2,
    });

    if (result.canceled) return;

    const chosen = result.assets?.map((asset: ImagePicker.ImagePickerAsset) => ({ uri: asset.uri })) ?? [];
    setDrafts((prev) => {
      const merged = [...prev, ...chosen];
      return merged.slice(0, 2); // garante no máximo 2 imagens
    });
  };

  const handleRemove = (uri: string) => {
    setDrafts((prev) => prev.filter((d) => d.uri !== uri));
  };

  const ensureTagInDescription = (desc: string, tag: string) => {
    const normalized = desc.toLowerCase();
    const needle = `#${tag.toLowerCase()}`;
    if (normalized.includes(needle)) return desc;
    return `${desc.trim()} ${needle}`.trim();
  };

  const removeTagFromDescription = (desc: string, tag: string) => {
    const regex = new RegExp(`(^|\s)#${tag}(?=\s|$)`, 'gi');
    return desc.replace(regex, '').replace(/\s+/g, ' ').trim();
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id);
      if (exists) {
        setPostDescription((prevDesc) => removeTagFromDescription(prevDesc, category.name));
        return prev.filter((c) => c.id !== category.id);
      }
      setPostDescription((prevDesc) => ensureTagInDescription(prevDesc, category.name));
      return [...prev, category];
    });
  };

  const handlePublish = async () => {
    if (!drafts.length) {
      Alert.alert('Selecione imagens', 'Escolha pelo menos uma imagem para publicar.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Adicione um título para o seu post.');
      return;
    }
    try {
      setPublishing(true);

      const descWithTags = selectedCategories.reduce(
        (acc, cat) => ensureTagInDescription(acc, cat.name),
        postDescription,
      );

      await addPost({
        images: drafts.map((d) => ({ uri: d.uri })),
        title: title.trim(),
        categoryId: selectedCategories[0]?.id,
        categoryName: selectedCategories[0]?.name,
        description: descWithTags,
      });
      setDrafts([]);
      setTitle('');
      setPostDescription('');
      setSelectedCategories([]);
      router.replace('/(tabs)/perfil');
    } catch (err) {
      Alert.alert('Erro ao publicar', 'Tente novamente.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back-outline" size={24} color="#fff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Nova publicação</Text>
      <Text style={styles.subtitle}>Adicione imagens e descreva seu projeto.</Text>

      <Text style={styles.label}>Título do post</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Dê um nome para sua publicação"
        placeholderTextColor="#777"
        style={styles.input}
      />

      <Text style={styles.label}>Categorias</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {loadingCategories && <Text style={styles.placeholder}>Carregando categorias...</Text>}
        {!loadingCategories && categories.map((cat) => {
          const active = selectedCategories.some((c) => c.id === cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleCategory(cat)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>#{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Descrição geral</Text>
      <TextInput
        value={postDescription}
        onChangeText={setPostDescription}
        placeholder="Fale sobre o post. As categorias viram #hashtag automaticamente."
        placeholderTextColor="#777"
        multiline
        style={[styles.input, { minHeight: 90 }]}
      />

      <TouchableOpacity style={styles.addButton} onPress={handlePickImages}>
        <Text style={styles.addButtonText}>Escolher imagens do dispositivo</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
        {drafts.length === 0 && (
          <Text style={styles.placeholder}>Nenhuma imagem selecionada ainda.</Text>
        )}
        {drafts.map((item, index) => (
          <View key={item.uri} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Imagem {index + 1}</Text>
              <TouchableOpacity onPress={() => handleRemove(item.uri)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
            <Image source={{ uri: item.uri }} style={styles.preview} />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.publishButton, drafts.length === 0 && styles.publishDisabled]}
        disabled={!drafts.length || publishing}
        onPress={handlePublish}
      >
        <Text style={styles.publishText}>{publishing ? 'Publicando...' : 'Publicar no perfil'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    fontWeight: '700',
    marginBottom: 6,
  },
  addButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#0B0B0B',
    fontWeight: '800',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '700',
  },
  removeText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#1f1f1f',
  },
  input: {
    backgroundColor: '#0B0B0B',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    minHeight: 60,
  },
  publishButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  publishDisabled: {
    opacity: 0.5,
  },
  publishText: {
    color: '#0B0B0B',
    fontWeight: '800',
    fontSize: 16,
  },
  chipsRow: {
    maxHeight: 44,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    backgroundColor: '#0b0b0b',
  },
  chipActive: {
    borderColor: '#A78BFA',
    backgroundColor: '#1f1a2e',
  },
  chipText: {
    color: '#ccc',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
});
