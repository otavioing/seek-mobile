import { api } from '@/src/services/api'; // ajusta o caminho se precisar
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    buscarPosts();
  }, []);

  const buscarPosts = async () => {
    try {
      const response = await api.get('/posts');

      const dadosTratados = response.data.map((post: any) => {
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

      // preserva posts locais (criados offline ou não retornados pelo backend)
      setPosts((prev) => {
        const locais = prev.filter((p) => p.id.startsWith('user-') || p.userId === 'me');
        const merged = [...locais, ...dadosTratados];
        const uniq = new Map<string, Post>();
        merged.forEach((p) => uniq.set(p.id, p));
        return Array.from(uniq.values());
      });

    } catch (error) {
      console.log('Erro ao buscar posts:', error);
    }
  };

  const addPost = async (input: NewPostInput) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      let author = 'Você';
      let avatar: any = { uri: '' };

      if (userId) {
        try {
          const { data } = await api.get(`/usuarios/foto-perfil/${userId}`);
          author = data?.nome || author;
          if (data?.foto) avatar = { uri: data.foto };
        } catch (e) {
          console.log('Falha ao carregar dados do usuário para o post', e);
        }
      }

      // envia para o backend usando FormData (rota espera upload.single("arquivo"))
      let createdId = `user-${Date.now()}`;
      let returnedImages = input.images;

      if (userId && input.images.length) {
        const firstTwo = input.images.slice(0, 2);
        const form = new FormData();
        form.append('user_id', userId);
        form.append('legenda', input.description || '');
        form.append('titulo', input.title || '');
        form.append('id_categoria', input.categoryId || '');
        firstTwo.forEach((file, idx) => {
          const payload = {
            uri: file.uri || file,
            name: `post-${idx + 1}.jpg`,
            type: 'image/jpeg',
          } as any;
          // Alguns backends esperam "arquivo", outros "imagem"; mandamos ambos para garantir
          form.append('arquivo', payload);
          form.append('imagem', payload);
        });

        try {
          const resp = await api.post('/posts', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          createdId = String(resp.data?.id ?? createdId);
          if (resp.data?.imagens && Array.isArray(resp.data.imagens)) {
            returnedImages = resp.data.imagens.map((img: any) => ({ uri: img }));
          } else if (resp.data?.imagem) {
            returnedImages = [{ uri: resp.data.imagem }];
          }
          if (resp.data?.foto_perfil) avatar = { uri: resp.data.foto_perfil };
          if (resp.data?.nome) author = resp.data.nome;
          // Após criar, recarrega lista oficial do backend para garantir path completo
          await buscarPosts();
          return;
        } catch (e) {
          console.log('Falha ao salvar post no backend, mantendo local:', e);
        }
      }

      const newPost: Post = {
        id: createdId,
        author,
        userId: userId || 'me',
        followers: 'seguindo',
        images: returnedImages,
        avatar,
        likes: 0,
        comments: [],
        title: input.title,
        categoryId: input.categoryId,
        categoryName: input.categoryName,
        description: input.description,
        postedAt: Date.now(),
      };

      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.log('Erro ao adicionar post:', error);
      throw error;
    }
  };

  const removePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await api.delete(`/posts/${postId}`);
    } catch (error) {
      console.log('Erro ao remover post no backend:', error);
    }
  };

  const refreshPosts = async () => {
    await buscarPosts();
  };

  const value = useMemo(() => ({
    posts,
    addPost,
    removePost,
    refreshPosts
  }), [posts]);

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