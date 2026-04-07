import { api } from '@/src/services/api';
import React, { createContext, useContext, useState } from 'react';

export interface Comment {
  id: string;
  user: string;
  text: string;
  avatar?: any;
  userId?: string;
  createdAt?: string;
}

interface CommentsContextType {
  commentsByPost: Record<string, Comment[]>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, userId: string, text: string) => Promise<void>;
}

const CommentsContext = createContext<CommentsContextType>({} as CommentsContextType);

export const CommentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});

  // 🔽 Buscar comentários
  const fetchComments = async (postId: string) => {
    try {
      const response = await api.get(`/comentarios/${postId}`);

      const formatted: Comment[] = response.data.map((c: any) => ({
        id: String(c.id),
        user: c.nome_de_usuario || c.nome || 'Usuário',
        text: c.comentario,
        avatar: c.foto
          ? { uri: `${api.defaults.baseURL}${c.foto}` }
          : require('@/assets/images/default-avatar.png'), // opcional
        userId: c.idusuario
          ? String(c.idusuario)
          : c.id_usuario
            ? String(c.id_usuario)
            : c.idUsuario
              ? String(c.idUsuario)
              : c.user_id
                ? String(c.user_id)
                : c.usuario_id
                  ? String(c.usuario_id)
              : c.usuario?.id
                ? String(c.usuario.id)
                : undefined,
        createdAt: c.criado_em
      }));

      setCommentsByPost(prev => ({
        ...prev,
        [postId]: formatted
      }));

    } catch (error) {
      console.log('❌ Erro ao buscar comentários:', error);
    }
  };

  // 🔽 Adicionar comentário
  const addComment = async (postId: string, userId: string, text: string) => {
    try {
      await api.post(`/comentarios/${postId}`, {
        idusuario: userId,
        conteudo: text
      });

      const newComment: Comment = {
        id: String(Date.now()),
        user: 'Você',
        text,
        userId,
        createdAt: new Date().toISOString()
      };

      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

    } catch (error) {
      console.log('❌ Erro ao comentar:', error);
      throw error;
    }
  };

  return (
    <CommentsContext.Provider value={{ commentsByPost, fetchComments, addComment }}>
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);

  if (!context) {
    throw new Error('useComments deve ser usado dentro de um CommentsProvider');
  }

  return context;
};