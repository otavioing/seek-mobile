import { api } from '@/src/services/api';
import React, { createContext, useContext, useState } from 'react';

export interface Comment {
  id: string;
  user: string;
  text: string;
  avatar?: any;
  userId?: string;
  createdAt?: string;
  replies: Comment[];
}

interface CommentsContextType {
  commentsByPost: Record<string, Comment[]>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, userId: string, text: string) => Promise<void>;
  addReply: (postId: string, parentCommentId: string, userId: string, text: string) => Promise<void>;
}

const CommentsContext = createContext<CommentsContextType>({} as CommentsContextType);

export const CommentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});

  const toAvatarSource = (foto: string | null | undefined) => {
    if (!foto) {
      return require('../../assets/images/default-avatar.png');
    }

    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return { uri: foto };
    }

    return { uri: `${api.defaults.baseURL}${foto}` };
  };

  const extractUserId = (comment: any) => {
    if (comment.idusuario) return String(comment.idusuario);
    if (comment.id_usuario) return String(comment.id_usuario);
    if (comment.idUsuario) return String(comment.idUsuario);
    if (comment.user_id) return String(comment.user_id);
    if (comment.usuario_id) return String(comment.usuario_id);
    if (comment.usuario?.id) return String(comment.usuario.id);
    return undefined;
  };

  const formatComment = (comment: any): Comment => ({
    id: String(comment.id),
    user: comment.nome_de_usuario || comment.nome || 'Usuário',
    text: comment.comentario,
    avatar: toAvatarSource(comment.foto),
    userId: extractUserId(comment),
    createdAt: comment.criado_em,
    replies: Array.isArray(comment.respostas)
      ? comment.respostas.map((reply: any) => formatComment(reply))
      : []
  });

  // 🔽 Buscar comentários
  const fetchComments = async (postId: string) => {
    try {
      const response = await api.get(`/comentarios/${postId}`);

      const formatted: Comment[] = response.data.map((c: any) => formatComment(c));

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

      await fetchComments(postId);

    } catch (error) {
      console.log('❌ Erro ao comentar:', error);
      throw error;
    }
  };

  const addReply = async (postId: string, parentCommentId: string, userId: string, text: string) => {
    try {
      await api.post(`/comentarios/${postId}/responder/${parentCommentId}`, {
        idusuario: userId,
        conteudo: text
      });

      await fetchComments(postId);

    } catch (error) {
      console.log('❌ Erro ao responder comentário:', error);
      throw error;
    }
  };

  return (
    <CommentsContext.Provider value={{ commentsByPost, fetchComments, addComment, addReply }}>
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