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

  const getStatusCode = (error: unknown): number | undefined => {
    return (error as any)?.response?.status;
  };

  const isRetryableRouteError = (error: unknown) => {
    const status = getStatusCode(error);
    return status === 404 || status === 400 || status === 409 || status === 415 || status === 422;
  };

  const createLocalComment = (userId: string, text: string): Comment => ({
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    user: 'Você',
    text,
    avatar: require('../../assets/images/default-avatar.png'),
    userId: String(userId),
    createdAt: new Date().toISOString(),
    replies: [],
  });

  const insertReplyIntoTree = (list: Comment[], parentId: string, reply: Comment): Comment[] => {
    let found = false;
    const next = list.map((c) => {
      if (c.id === parentId) {
        found = true;
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      if (c.replies?.length) {
        const updatedReplies = insertReplyIntoTree(c.replies, parentId, reply);
        if (updatedReplies !== c.replies) {
          found = true;
          return { ...c, replies: updatedReplies };
        }
      }
      return c;
    });

    return found ? next : list;
  };

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

  const extractText = (comment: any) => {
    return (
      comment.comentario ??
      comment.conteudo ??
      comment.text ??
      comment.mensagem ??
      ''
    );
  };

  const extractReplies = (comment: any) => {
    const replies =
      comment.respostas ??
      comment.replies ??
      comment.respostas_comentarios ??
      comment.respostasComentarios;

    return Array.isArray(replies) ? replies : [];
  };

  const formatComment = (comment: any): Comment => ({
    id: String(comment.id),
    user: comment.nome_de_usuario || comment.nome || 'Usuário',
    text: extractText(comment),
    avatar: toAvatarSource(comment.foto),
    userId: extractUserId(comment),
    createdAt: comment.criado_em,
    replies: extractReplies(comment).map((reply: any) => formatComment(reply))
  });

  // 🔽 Buscar comentários
  const fetchComments = async (postId: string) => {
    try {
      const urls = [
        `/comentarios/${postId}`,
        `/api/comentarios/${postId}`,
        `/posts/${postId}/comentarios`,
        `/api/posts/${postId}/comentarios`,
        `/posts/comentarios/${postId}`,
        `/api/posts/comentarios/${postId}`,
      ];

      let data: any = null;
      let lastError: unknown;

      for (const url of urls) {
        try {
          const response = await api.get(url);
          data = response.data;
          lastError = undefined;
          break;
        } catch (e) {
          lastError = e;
          if (getStatusCode(e) === 404) continue;
          throw e;
        }
      }

      if (!Array.isArray(data)) {
        // Se nenhuma rota de comentários existe (404), mantém o que já está no state (ex.: comentários locais)
        if (getStatusCode(lastError) === 404) return;
        if (lastError) throw lastError;
        data = [];
      }

      const formatted: Comment[] = data.map((c: any) => formatComment(c));

      setCommentsByPost(prev => ({
        ...prev,
        [postId]: formatted
      }));

    } catch (error) {
      // Se a API não tem comentários, não polui o console; comentários locais continuam funcionando
      if (getStatusCode(error) !== 404) {
        console.log('❌ Erro ao buscar comentários:', error);
      }
    }
  };

  // 🔽 Adicionar comentário
  const addComment = async (postId: string, userId: string, text: string) => {
    try {
      const numericUserId = Number(userId);
      const numericPostId = Number(postId);

      const payloads = [
        { idusuario: userId, conteudo: text },
        { idusuario: numericUserId, conteudo: text },
        { idusuario: userId, comentario: text },
        { userId: numericUserId, postId: numericPostId, conteudo: text },
        { userId: numericUserId, postId: numericPostId, comentario: text },
        { usuario_id: numericUserId, post_id: numericPostId, conteudo: text },
        { usuario_id: numericUserId, post_id: numericPostId, comentario: text },
      ];

      const urls = [
        `/comentarios/${postId}`,
        `/api/comentarios/${postId}`,
        `/posts/${postId}/comentarios`,
        `/api/posts/${postId}/comentarios`,
        `/posts/comentarios/${postId}`,
        `/api/posts/comentarios/${postId}`,
        `/comentarios`,
        `/api/comentarios`,
        `/posts/${postId}/comentario`,
        `/api/posts/${postId}/comentario`,
        `/posts/comentar/${postId}`,
        `/api/posts/comentar/${postId}`,
      ];

      const tried: string[] = [];
      let lastError: unknown;

      outer: for (const url of urls) {
        for (const payload of payloads) {
          try {
            tried.push(url);
            await api.post(url, payload);
            lastError = undefined;
            break outer;
          } catch (e) {
            lastError = e;
            if (isRetryableRouteError(e)) continue;
            throw e;
          }
        }
      }

      if (lastError) {
        const status = getStatusCode(lastError);
        if (status === 404) {
          // Backend ainda não tem rotas de comentários -> salva localmente pra UI funcionar
          const local = createLocalComment(userId, text);
          setCommentsByPost((prev) => {
            const current = prev[postId] || [];
            return { ...prev, [postId]: [local, ...current] };
          });
          return;
        }

        console.log('❌ addComment falhou. Rotas tentadas:', Array.from(new Set(tried)));
        throw lastError;
      }

      await fetchComments(postId);

    } catch (error) {
      console.log('❌ Erro ao comentar:', error);
      throw error;
    }
  };

  const addReply = async (postId: string, parentCommentId: string, userId: string, text: string) => {
    try {
      const numericUserId = Number(userId);
      const replyUrl = `/comentarios/${postId}/responder/${parentCommentId}`;
      const payload = {
        idusuario: Number.isNaN(numericUserId) ? userId : String(numericUserId),
        conteudo: text,
      };

      let lastError: unknown;

      try {
        await api.post(replyUrl, payload);
        lastError = undefined;
      } catch (e) {
        lastError = e;
        if (!isRetryableRouteError(e)) {
          throw e;
        }
      }

      if (lastError) {
        const status = getStatusCode(lastError);
        if (status === 404) {
          // Backend ainda não tem rotas de respostas -> salva localmente pra UI funcionar
          const localReply = createLocalComment(userId, text);
          setCommentsByPost((prev) => {
            const current = prev[postId] || [];
            const next = insertReplyIntoTree(current, parentCommentId, localReply);
            // Se não achou o pai (por exemplo, lista vazia), cai como comentário normal
            const finalList = next === current ? [localReply, ...current] : next;
            return { ...prev, [postId]: finalList };
          });
          return;
        }

        console.log('❌ addReply falhou. Rota tentada:', replyUrl);
        throw lastError;
      }

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