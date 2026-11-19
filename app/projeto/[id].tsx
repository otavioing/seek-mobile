import { PostDetailModal } from '../(tabs)/(home)/principal';
import { Post } from '@/src/context/PostsContext';
import { apiErrorMessage, normalizePost } from '@/src/services/api';
import { postsApi } from '@/src/services/seek';
import { getFeedTheme } from '@/src/theme/appTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function Projeto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const theme = getFeedTheme(dark);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('tema').then(value => setDark(value === 'escuro'));
    postsApi.detail(id).then(({ data }) => {
      const value = normalizePost(data);
      if (active) setPost({ id: String(value.id), author: value.user.nome || 'Usuário', userId: String(value.user.id), followers: '', images: value.imagens.map((uri: string) => ({ uri })), avatar: value.user.foto ? { uri: value.user.foto } : require('../../assets/images/default-avatar.png'), likes: value.total_likes, comments: [], title: value.titulo, description: value.legenda, postedAt: value.criado_em ? new Date(value.criado_em).getTime() : Date.now() });
    }).catch(e => { if (active) setError(apiErrorMessage(e)); });
    return () => { active = false; };
  }, [id]);
  return <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
    <TouchableOpacity onPress={() => router.back()}><Text style={{ color: theme.textPrimary }}>Voltar</Text></TouchableOpacity>
    {!!error ? <Text accessibilityRole="alert" style={{ color: '#dc2626' }}>{error}</Text> : !post && <ActivityIndicator />}
    {post && <PostDetailModal visible post={post} theme={theme} onClose={() => router.back()} onPressAuthor={value => value.userId && router.push(`/usuario/${value.userId}` as any)} onPressCommentAuthor={comment => comment.userId && router.push(`/usuario/${comment.userId}` as any)} />}
  </View>;
}
