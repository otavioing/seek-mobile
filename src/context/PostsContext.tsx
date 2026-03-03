import React, { createContext, useContext, useMemo, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

export type Comment = {
  id: string;
  user: string;
  text: string;
};

export type Post = {
  id: string;
  author: string;
  followers: string;
  images: ImageSourcePropType[];
  likes: number;
  comments: Comment[];
  description?: string;
  postedAt: number;
};

type NewPostInput = {
  images: ImageSourcePropType[];
  description?: string;
};

type PostsContextValue = {
  posts: Post[];
  addPost: (input: NewPostInput) => void;
};

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

const initialPosts: Post[] = [
  {
    id: 'p1',
    author: 'Nome autor',
    followers: '10000 seguindo',
    images: [require('@/assets/images/tabsHome/imgT5.jpg')],
    likes: 152,
    comments: [
      { id: 'c1', user: 'Ana', text: 'Que foto incrível!' },
      { id: 'c2', user: 'Marcos', text: 'Adorei as cores.' },
    ],
    description: 'Explorando novas paletas e texturas.',
    postedAt: Date.now() - 1000 * 60 * 60 * 2, // 2h atrás
  },
  {
    id: 'p2',
    author: 'Outro Artista',
    followers: '2345 seguindo',
    images: [require('@/assets/images/tabsHome/imgT1.jpg')],
    likes: 98,
    comments: [
      { id: 'c3', user: 'Julia', text: 'Onde é isso?' },
    ],
    description: 'City vibes.',
    postedAt: Date.now() - 1000 * 60 * 60 * 26, // 1d 2h atrás
  },
  {
    id: 'p3',
    author: 'Paisagens Urbanas',
    followers: '7890 seguindo',
    images: [require('@/assets/images/tabsHome/imgT7.jpg')],
    likes: 230,
    comments: [],
    description: 'Geometrias e luz.',
    postedAt: Date.now() - 1000 * 60 * 15, // 15min atrás
  },
];

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const addPost = (input: NewPostInput) => {
    const newPost: Post = {
      id: `user-${Date.now()}`,
      author: 'Você',
      followers: 'seguindo',
      images: input.images,
      likes: 0,
      comments: [],
      description: input.description,
    postedAt: Date.now(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const value = useMemo(() => ({ posts, addPost }), [posts]);

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
};
