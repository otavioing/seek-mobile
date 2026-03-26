import { Post, usePosts } from '@/src/context/PostsContext';
import { api } from '@/src/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Category = { id: string; name: string };

export default function EditarPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, refreshPosts, removePost } = usePosts();
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  const found = useMemo(() => posts.find((p) => p.id === id), [posts, id]);

  useEffect(() => {
    if (found) {
      setPost(found);
      setTitle(found.title || '');
      setDescription(found.description || '');
      if (found.categoryId || found.categoryName) {
        setSelectedCategory({
          id: found.categoryId || 'selected',
          name: found.categoryName || '',
        });
      }
    }
  }, [found]);

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
          .filter((c) => c.id && c.name);
        setCategories(mapped);

        // se o post já tem categoria, tenta casar pelo nome para manter o chip ativo
        if (!selectedCategory && mapped.length && post?.categoryName) {
          const match = mapped.find((c) => c.name.toLowerCase() === post.categoryName?.toLowerCase());
          if (match) setSelectedCategory(match);
        }
      } catch (error) {
        console.log('Erro ao carregar categorias', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [post?.categoryName, selectedCategory]);

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

  const handleToggleCategory = (category: Category) => {
    setSelectedCategory((prev) => {
      if (prev && prev.id === category.id) {
        setDescription((prevDesc) => removeTagFromDescription(prevDesc, category.name));
        return null;
      }

      setDescription((prevDesc) => ensureTagInDescription(prevDesc, category.name));
      return category;
    });
  };

  const handleSave = async () => {
    if (!post) return;
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Adicione um título para o post.');
      return;
    }
    try {
      setSaving(true);
      // Atualiza apenas a legenda. Se o backend tiver endpoint específico, ajuste aqui.
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || ''}/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legenda: description,
          titulo: title,
          id_categoria: selectedCategory?.id || '',
        }),
      });
      await refreshPosts();
      Alert.alert('Pronto', 'Post atualizado');
      router.back();
    } catch (e) {
      console.log('Erro ao editar post', e);
      Alert.alert('Erro', 'Não foi possível editar o post');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!post) return;
    Alert.alert('Remover post', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await removePost(post.id);
          await refreshPosts();
          router.replace('/(tabs)/perfil');
        },
      },
    ]);
  };

  if (!post) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.text}>Post não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Icon name="arrow-back-outline" size={24} color="#fff" />
          <Text style={styles.text}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRemove}>
          <Text style={[styles.text, { color: '#ff6b6b' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Editar post</Text>

      {post.images[0] && (
        <Image source={post.images[0]} style={styles.preview} />
      )}

      <Text style={styles.label}>Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Qual é o título do post?"
        placeholderTextColor="#888"
        style={styles.input}
      />

      <Text style={styles.label}>Categoria</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
      >
        {loadingCategories && <Text style={styles.text}>Carregando categorias...</Text>}
        {!loadingCategories && categories.map((cat) => {
          const active = selectedCategory?.id === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => handleToggleCategory(cat)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>#{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Legenda</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Digite a legenda"
        placeholderTextColor="#888"
        multiline
        style={styles.input}
      />

      <Text style={styles.hint}>Nesta tela você pode alterar o texto da legenda. Para trocar ou remover a imagem, exclua o post e crie novamente (ou ajuste o backend com um endpoint de atualização de imagem).</Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0b0b0b',
    flexGrow: 1,
  },
  containerCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0b0b',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginVertical: 12 },
  preview: { width: '100%', height: 260, borderRadius: 12, marginBottom: 16 },
  label: { color: '#ccc', marginBottom: 6 },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  hint: { color: '#888', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  saveButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chipsRow: { maxHeight: 44, marginBottom: 12 },
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
    borderColor: '#4F46E5',
    backgroundColor: '#1f1a2e',
  },
  chipText: { color: '#ccc', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
});
