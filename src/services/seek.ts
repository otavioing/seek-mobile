import { api } from './api';

type Id = string | number;
const segment = (value: Id) => encodeURIComponent(String(value));
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

// Paths and bodies follow nova_api_seek/src/routes. Authentication uses the
// HTTP-only session cookie; user IDs are never sent as proof of identity.
export const authApi = {
  login: (email: string, senha: string) => api.post('/auth/login', { email: email.trim(), senha }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  id: () => api.get('/auth/id'),
  changePassword: (senha_atual: string, nova_senha: string) => api.put('/auth/password', { senha_atual, nova_senha }),
  changeEmail: (novo_email: string, senha_atual: string) => api.put('/auth/email', { novo_email: novo_email.trim(), senha_atual }),
  confirmEmail: (codigo: string) => api.post('/auth/email/confirmar', { codigo }),
  forgotPassword: (email: string) => api.post('/auth/esqueci-senha', { email: email.trim() }),
  resetPassword: (email: string, codigo: string, nova_senha: string) => api.post('/auth/redefinir-senha', { email: email.trim(), codigo, nova_senha }),
};

export const usersApi = {
  create: (body: Record<string, unknown>) => api.post('/usuarios', body),
  verify: (email: string, codigo: string) => api.post('/usuarios/verificar-codigo', { email: email.trim(), codigo }),
  resendCode: (email: string) => api.post('/usuarios/reenviar-codigo', { email: email.trim() }),
  firstLogin: () => api.get('/usuarios/verificar-primeiro-login'),
  completeRegistration: () => api.patch('/usuarios/completar-cadastro'),
  search: (termo: string, historico = true) => api.get('/usuarios/pesquisar', { params: { termo: termo.trim(), historico } }),
  searchHistory: () => api.get('/usuarios/historico-pesquisas'),
  deleteSearch: (id: Id) => api.delete(`/usuarios/historico-pesquisas/${segment(id)}`),
  profiles: () => api.get('/usuarios/perfil'),
  page: (id: Id) => api.get(`/usuarios/${segment(id)}`),
  updatePhoto: (form: FormData) => api.put('/usuarios/foto-perfil', form, multipart),
  updateBanner: (form: FormData) => api.put('/usuarios/banner-perfil', form, multipart),
  updateCompany: (body: Record<string, unknown>) => api.put('/usuarios/perfil-empresa', body),
  updatePerson: (body: Record<string, unknown> | FormData) => api.put('/usuarios/perfil-pessoa-fisica', body, body instanceof FormData ? multipart : undefined),
};

export const postsApi = {
  list: () => api.get('/posts'),
  detail: (id: Id) => api.get(`/posts/${segment(id)}`),
  create: (form: FormData) => api.post('/posts', form, multipart),
  remove: (id: Id) => api.delete(`/posts/${segment(id)}`),
  byCategory: (id: Id) => api.get(`/posts/categoria/${segment(id)}`),
  byUser: (id: Id) => api.get(`/posts/usuario/${segment(id)}`),
  popularCategories: () => api.get('/categorias/populares'),
  like: (id: Id) => api.post(`/posts/${segment(id)}/like`),
  unlike: (id: Id) => api.delete(`/posts/${segment(id)}/like`),
  liked: () => api.get('/posts/curtidos'),
  save: (id: Id) => api.post(`/posts/${segment(id)}/salvar`),
  unsave: (id: Id) => api.delete(`/posts/${segment(id)}/salvar`),
  saved: () => api.get('/posts/salvos'),
  comment: (id: Id, comentario: string) => api.post(`/posts/${segment(id)}/comentarios`, { comentario: comentario.trim() }),
  reply: (id: Id, resposta: string) => api.post(`/posts/comentarios/${segment(id)}/respostas`, { resposta: resposta.trim() }),
  replies: (id: Id) => api.get(`/posts/comentarios/${segment(id)}/respostas`),
};

export const followsApi = {
  follow: (id: Id) => api.post(`/seguidores/${segment(id)}`),
  unfollow: (id: Id) => api.delete(`/seguidores/${segment(id)}`),
  followers: (id: Id) => api.get(`/seguidores/seguidores/${segment(id)}`),
  following: (id: Id) => api.get(`/seguidores/seguindo/${segment(id)}`),
  status: (id: Id) => api.get(`/seguidores/status/${segment(id)}`),
};

export const messagesApi = {
  startConversation: (id: Id) => api.post('/mensagens/conversas', { id_destinatario: Number(id) }),
  conversations: () => api.get('/mensagens/conversas'),
  send: (id: Id, mensagem: string) => api.post(`/mensagens/conversas/${segment(id)}/mensagens`, { mensagem: mensagem.trim() }),
  messages: (id: Id) => api.get(`/mensagens/conversas/${segment(id)}/mensagens`),
};

export const notificationsApi = {
  list: () => api.get('/notificacoes'),
  clear: () => api.delete('/notificacoes'),
  read: (id: Id) => api.patch(`/notificacoes/${segment(id)}/lida`),
  remove: (id: Id) => api.delete(`/notificacoes/${segment(id)}`),
  preferences: () => api.get('/preferencias-notificacoes'),
  updatePreferences: (preferencias: Record<string, boolean>) => api.put('/preferencias-notificacoes', { preferencias }),
};

export const jobsApi = {
  list: () => api.get('/vagas'),
  create: (body: { titulo: string; descricao: string; url: string; categorias: (string | number)[] }) => api.post('/vagas', body),
  byCategory: (categoria: Id) => api.get(`/vagas/categoria/${segment(categoria)}`),
  byDate: (inicio: string, fim: string) => api.get('/vagas/data', { params: { inicio, fim } }),
  popularCategories: (limite = 10) => api.get('/vagas/mais-utilizados', { params: { limite } }),
  favorites: () => api.get('/vagas/favoritas'),
  byUser: (id: Id) => api.get(`/vagas/usuario/${segment(id)}`),
  favorite: (id: Id) => api.post(`/vagas/${segment(id)}/favoritar`),
  detail: (id: Id) => api.get(`/vagas/${segment(id)}`),
  unfavorite: (id: Id) => api.delete(`/vagas/${segment(id)}/favoritar`),
};

export function isValidDate(value: string) {
  const date = new Date(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function listFilteredJobs({ categoria, inicio, fim, userId }: { categoria?: string; inicio?: string; fim?: string; userId?: string }) {
  if ((inicio || fim) && (!isValidDate(inicio || '') || !isValidDate(fim || '') || inicio! > fim!)) throw new Error('Período de datas inválido.');
  const requests = [];
  if (categoria) requests.push(jobsApi.byCategory(categoria));
  if (inicio || fim) {
    requests.push(jobsApi.byDate(inicio!, fim!));
  }
  if (userId) requests.push(jobsApi.byUser(userId));
  if (!requests.length) requests.push(jobsApi.list());
  const results = await Promise.all(requests);
  return results[0].data.filter((item: any) => results.every(result => result.data.some((other: any) => String(other.id) === String(item.id))));
}
