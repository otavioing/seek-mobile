import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Comment = {
  id: string;
  user: string;
  text: string;
};

export type FollowedPost = {
  id: string;
  author: string;
  userId?: string;
  followers: string;
  title?: string;
  description?: string;
  imageUrl: { uri: string };
  avatar: { uri: string };
  likes: number;
  comments: Comment[];
};

type FollowedPostsContextValue = {
  posts: FollowedPost[];
  loading: boolean;
  refreshPosts: () => Promise<void>;
};

const FollowedPostsContext = createContext<FollowedPostsContextValue | undefined>(undefined);

export const FollowedPostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<FollowedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPosts = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        setPosts([]);
        return;
      }

      const response = await api.get(`/posts/posts-seguidos/${userId}`);

      const parsed = (response.data || []).map((post: any) => ({
        id: String(post.id),
        author: post.user?.nome || 'Usuário',
        userId:
          post.user?.id
            ? String(post.user.id)
            : post.user?.idusuario
              ? String(post.user.idusuario)
              : post.user?.id_usuario
                ? String(post.user.id_usuario)
                : post.idusuario
                  ? String(post.idusuario)
                  : post.id_usuario
                    ? String(post.id_usuario)
                    : post.idUsuario
                      ? String(post.idUsuario)
                      : undefined,
        followers: `${post.total_seguidores || 0} seguidores`,
        title: post.titulo || '',
        description: post.legenda || '',
        imageUrl: {
          uri: post.imagens?.[0] || 'https://via.placeholder.com/300',
        },
        avatar: {
          uri: post.user?.foto || 'https://via.placeholder.com/100',
        },
        likes: post.total_likes || 0,
        comments: [],
      })) as FollowedPost[];

      setPosts(parsed);
    } catch (error) {
      console.log('Erro ao buscar posts seguidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const value = useMemo(
    () => ({ posts, loading, refreshPosts }),
    [posts, loading]
  );

  return <FollowedPostsContext.Provider value={value}>{children}</FollowedPostsContext.Provider>;
};

export const useFollowedPosts = () => {
  const ctx = useContext(FollowedPostsContext);
  if (!ctx) {
    throw new Error('useFollowedPosts must be used within FollowedPostsProvider');
  }
  return ctx;
};
