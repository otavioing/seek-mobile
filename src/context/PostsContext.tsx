import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '@/src/services/api'; // ajusta o caminho se precisar

export type Comment = {
  id: string;
  user: string;
  text: string;
};

export type Post = {
  id: string;
  author: string;
  followers: string;
  images: any[];
  avatar: any;
  likes: number;
  comments: Comment[];
  description?: string;
  postedAt: number;
};

type NewPostInput = {
  images: any[];
  description?: string;
};

type PostsContextValue = {
  posts: Post[];
  addPost: (input: NewPostInput) => void;
  refreshPosts: () => void; // 🔥 pra atualizar depois
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

      const dadosTratados = response.data.map((post: any) => ({
        id: String(post.id),
        author: post.nome,
        followers: `${post.total_seguidores} seguidores`,
        description: post.legenda,
        postedAt: new Date(post.criado_em).getTime(),
        likes: 0,
        images: [{ uri: post.imagem }],
        avatar: { uri: post.foto_perfil },
        comments: []
      }));

      setPosts(dadosTratados);

    } catch (error) {
      console.log('Erro ao buscar posts:', error);
    }
  };

  const addPost = (input: NewPostInput) => {
    const newPost: Post = {
      id: `user-${Date.now()}`,
      author: 'Você',
      followers: 'seguindo',
      images: input.images,
      avatar: { uri: '' },
      likes: 0,
      comments: [],
      description: input.description,
      postedAt: Date.now(),
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  const refreshPosts = () => {
    buscarPosts();
  };

  const value = useMemo(() => ({
    posts,
    addPost,
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