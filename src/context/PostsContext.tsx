import { api, normalizePost, appendImage } from '@/src/services/api'; // ajusta o caminho se precisar
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSessionScope } from './useSessionScope';

export type Comment = {
  id: string;
  user: string;
  text: string;
};

export type Post = {
  id: string;
  author: string;
  userId?: string;
  followers: string;
  images: any[];
  avatar: any;
  likes: number;
  comments: Comment[];
  title?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  postedAt: number;
};

type NewPostInput = {
  images: any[];
  title?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
};

type PostsContextValue = {
  posts: Post[];
  addPost: (input: NewPostInput) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
  refreshPosts: () => Promise<void>; // 🔥 pra atualizar depois
};

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

export const PostsProvider = ({ children, sessionUserId }: { children: React.ReactNode; sessionUserId: string | null }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const scope = useSessionScope(sessionUserId);

  const buscarPosts = useCallback(async () => {
    if (!sessionUserId) return;
    const generation = scope.current;
    try {
      const response = await api.get('/posts');
      if (generation !== scope.current) return;

      const dadosTratados = response.data.map(normalizePost).map((post: any) => {
        const imagensApi = Array.isArray(post.imagens)
          ? post.imagens.map((img: any) => ({ uri: img }))
          : post.imagem
            ? [{ uri: post.imagem }]
            : [];

        return {
          id: String(post.id),
          author: post.user?.nome || 'Usuário',
          userId: post.user?.id ? String(post.user.id) : undefined,
          followers: `${post.total_seguidores ?? 0} seguidores`,
          title: post.titulo || '',
          categoryId: post.id_categoria ? String(post.id_categoria) : undefined,
          categoryName: post.nome_categoria || post.categoria || undefined,
          description: post.legenda,
          postedAt: post.criado_em ? new Date(post.criado_em).getTime() : Date.now(),
          likes: post.total_likes ?? 0,
          images: imagensApi,
          avatar: post.user?.foto ? { uri: post.user.foto } : null,
          comments: []
        } as Post;
      });

      setPosts(dadosTratados);

    } catch (error) {
      console.log('Erro ao buscar posts:', error);
    }
  }, [scope, sessionUserId]);

  useEffect(() => {
    setPosts([]);
    void buscarPosts();
  }, [buscarPosts]);

  const addPost = useCallback(async (input: NewPostInput) => {
    if (!sessionUserId) throw new Error('Faça login para publicar.');
    const generation = scope.current;
    const form = new FormData();
    form.append('titulo', input.title || '');
    form.append('descricao', input.description || '');
    form.append('visibilidade', 'publico');
    form.append('permissao_comentarios', 'todos');
    form.append('categorias', JSON.stringify(input.categoryName ? [input.categoryName] : []));
    for (const [index, file] of input.images.slice(0, 10).entries()) await appendImage(form, 'imagens', file.uri || file, `post-${index}.jpg`);
    await api.post('/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (generation === scope.current) await buscarPosts();
  }, [scope, sessionUserId, buscarPosts]);

  const removePost = useCallback(async (postId: string) => {
    if (!sessionUserId) throw new Error('Faça login para excluir uma publicação.');
    const generation = scope.current;
    await api.delete(`/posts/${postId}`);
    if (generation === scope.current) setPosts(prev => prev.filter(p => p.id !== postId));
  }, [scope, sessionUserId]);

  const refreshPosts = buscarPosts;

  const value = useMemo(() => ({
    posts,
    addPost,
    removePost,
    refreshPosts
  }), [posts, addPost, removePost, refreshPosts]);

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
};
