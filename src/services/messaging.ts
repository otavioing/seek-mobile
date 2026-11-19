import { fileUrl } from './api';
import { messagesApi } from './seek';

type ApiConversa = {
  id_conversa: number;
  id_destinatario: number;
  nome_destinatario?: string | null;
  foto_perfil?: string | null;
  ultima_mensagem: string | null;
  data_ultima_mensagem: string | null;
};

type ApiMensagem = {
  id: number;
  id_remetente: number;
  mensagem: string;
  data_envio: string;
};

export type Conversa = {
  id: number;
  destinatarioId: number;
  nome: string;
  foto: string | null;
  ultimaMensagem: string;
  hora: string;
  naoLida: boolean;
  online: boolean;
};

export type Mensagem = {
  id: number;
  texto: string;
  remetenteId: number;
  remetenteNome: string;
  remetenteFoto: string | null;
  hora: string;
  lida: boolean;
  minha: boolean;
};

const contactName = (name: unknown) => typeof name === 'string' && name.trim() ? name.trim() : 'Contato';

export const contactInitial = (name: unknown) => Array.from(contactName(name))[0].toLocaleUpperCase('pt-BR');

function formatTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function normalizeConversation(item: ApiConversa): Conversa {
  return {
    id: item.id_conversa,
    destinatarioId: item.id_destinatario,
    nome: contactName(item.nome_destinatario),
    foto: fileUrl(item.foto_perfil),
    ultimaMensagem: item.ultima_mensagem || 'Nenhuma mensagem ainda',
    hora: formatTime(item.data_ultima_mensagem),
    // The API currently exposes neither read receipts nor presence.
    naoLida: false,
    online: false,
  };
}

export function normalizeMessages(items: ApiMensagem[], currentUserId: string, conversation?: Conversa): Mensagem[] {
  return items.map(item => {
    const minha = String(item.id_remetente) === currentUserId;
    const contact = !minha && String(conversation?.destinatarioId) === String(item.id_remetente) ? conversation : undefined;
    return {
      id: item.id,
      texto: item.mensagem,
      remetenteId: item.id_remetente,
      remetenteNome: minha ? 'Você' : contact?.nome || 'Contato',
      remetenteFoto: contact?.foto || null,
      hora: formatTime(item.data_envio),
      lida: false,
      minha,
    };
  });
}

export async function loadConversationMessages(id: string, currentUserId: string): Promise<Mensagem[]> {
  // Message rows contain no sender profile. Resolve the other participant
  // from this conversation, while still showing messages if that lookup fails.
  const [messages, conversations] = await Promise.all([
    messagesApi.messages(id),
    messagesApi.conversations().catch(() => ({ data: [] })),
  ]);
  const rows: ApiConversa[] = Array.isArray(conversations.data) ? conversations.data : [];
  const conversation = rows.find(item => String(item.id_conversa) === id);
  return normalizeMessages(
    Array.isArray(messages.data) ? messages.data : [],
    currentUserId,
    conversation ? normalizeConversation(conversation) : undefined,
  );
}
