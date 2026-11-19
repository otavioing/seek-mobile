import { api, fileUrl } from '@/src/services/api';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSessionScope } from './useSessionScope';
export interface Comment { id: string; user: string; text: string; avatar?: any; userId?: string; createdAt?: string; parentCommentId?: string; replies: Comment[]; }
interface CommentsContextType {
  commentsByPost: Record<string, Comment[]>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, userId: string, text: string) => Promise<void>;
  addReply: (postId: string, parentCommentId: string, userId: string, text: string) => Promise<void>;
}
const CommentsContext = createContext<CommentsContextType>({} as CommentsContextType);
function format(c: any): Comment {
  const photo = fileUrl(c.foto_perfil ?? c.usuario?.foto_perfil);
  return { id: String(c.id), user: c.nome ?? c.usuario?.nome ?? 'Usuário', text: c.comentario ?? c.resposta ?? '', userId: String(c.usuario_id ?? c.usuario?.id ?? ''), createdAt: c.data_comentario ?? c.data_resposta, avatar: photo ? { uri: photo } : require('../../assets/images/default-avatar.png'), replies: [] };
}
export function CommentsProvider({ children, sessionUserId }: { children: React.ReactNode; sessionUserId: string | null }) {
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const scope = useSessionScope(sessionUserId);
  useEffect(() => { setCommentsByPost({}); }, [sessionUserId]);
  const fetchComments = useCallback(async (postId: string) => {
    if (!sessionUserId) return;
    const generation = scope.current;
    const { data } = await api.get(`/posts/${postId}`);
    if (generation !== scope.current) return;
    const comments = await Promise.all((data.comentarios || []).map(async (c: any) => {
      const comment = format(c);
      if (Number(c.quantidade_respostas) > 0) {
        const replies = await api.get(`/posts/comentarios/${c.id}/respostas`);
        comment.replies = replies.data.map((reply: any) => ({ ...format(reply), parentCommentId: String(c.id) }));
      }
      return comment;
    }));
    if (generation === scope.current) setCommentsByPost(prev => ({ ...prev, [postId]: comments }));
  }, [scope, sessionUserId]);
  const addComment = async (postId: string, userId: string, text: string) => {
    if (!sessionUserId) throw new Error('Faça login para comentar.');
    const generation = scope.current;
    await api.post(`/posts/${postId}/comentarios`, { comentario: text.trim() });
    if (generation === scope.current) await fetchComments(postId);
  };
  const addReply = async (postId: string, parentId: string, userId: string, text: string) => {
    if (!sessionUserId) throw new Error('Faça login para responder.');
    const generation = scope.current;
    await api.post(`/posts/comentarios/${parentId}/respostas`, { resposta: text.trim() });
    if (generation === scope.current) await fetchComments(postId);
  };
  return <CommentsContext.Provider value={{ commentsByPost, fetchComments, addComment, addReply }}>{children}</CommentsContext.Provider>;
}
export const useComments = () => useContext(CommentsContext);
