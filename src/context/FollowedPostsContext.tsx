import { api, normalizePost } from '@/src/services/api';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSessionScope } from './useSessionScope';

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

export const FollowedPostsProvider = ({ children, sessionUserId }: { children: React.ReactNode; sessionUserId: string | null }) => {
  const [posts, setPosts] = useState<FollowedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const scope = useSessionScope(sessionUserId);

  const refreshPosts = useCallback(async () => {
    const generation = scope.current;
    try {
      setLoading(true);
      const userId = sessionUserId;

      if (!userId) {
        setPosts([]);
        return;
      }

      const following = await api.get(`/seguidores/seguindo/${userId}`);
      if (generation !== scope.current) return;
      const feeds = await Promise.all(following.data.map((u: any) => api.get(`/posts/usuario/${u.id ?? u.id_usuario}`)));
      if (generation !== scope.current) return;
      const response = { data: feeds.flatMap(r => r.data) };

      const parsed = (response.data || []).map(normalizePost).map((post: any) => ({
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
      if (generation !== scope.current) return;
      console.log('Erro ao buscar posts seguidos:', error);
    } finally {
      if (generation === scope.current) setLoading(false);
    }
  }, [scope, sessionUserId]);

  useEffect(() => {
    setPosts([]);
    setLoading(false);
    void refreshPosts();
  }, [refreshPosts]);

  const value = useMemo(
    () => ({ posts, loading, refreshPosts }),
    [posts, loading, refreshPosts]
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
