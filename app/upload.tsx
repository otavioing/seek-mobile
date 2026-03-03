import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePosts } from '../src/context/PostsContext';

interface DraftImage {
  uri: string;
  description: string;
}

export default function UploadScreen() {
  const router = useRouter();
  const { addPost } = usePosts();
  const [drafts, setDrafts] = useState<DraftImage[]>([]);
  const [publishing, setPublishing] = useState(false);

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
      selectionLimit: 10,
    });

    if (result.canceled) return;

  const chosen = result.assets?.map((asset: ImagePicker.ImagePickerAsset) => ({ uri: asset.uri, description: '' })) ?? [];
    setDrafts((prev) => [...prev, ...chosen]);
  };

  const handleRemove = (uri: string) => {
    setDrafts((prev) => prev.filter((d) => d.uri !== uri));
  };

  const handleUpdateDescription = (uri: string, text: string) => {
    setDrafts((prev) => prev.map((d) => (d.uri === uri ? { ...d, description: text } : d)));
  };

  const handlePublish = async () => {
    if (!drafts.length) return;
    try {
      setPublishing(true);
      addPost({
        images: drafts.map((d) => ({ uri: d.uri })),
        description: drafts.map((d) => d.description).filter(Boolean).join(' \n'),
      });
      setDrafts([]);
      router.replace('/(tabs)/perfil');
    } catch (err) {
      Alert.alert('Erro ao publicar', 'Tente novamente.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova publicação</Text>
      <Text style={styles.subtitle}>Adicione imagens e descreva seu projeto.</Text>

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
            <TextInput
              value={item.description}
              onChangeText={(text) => handleUpdateDescription(item.uri, text)}
              placeholder="Descrição da imagem (opcional)"
              placeholderTextColor="#777"
              multiline
              style={styles.input}
            />
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
});
