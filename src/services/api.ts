import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios, { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const nativeHost = metroHost && !['localhost', '127.0.0.1', '0.0.0.0'].includes(metroHost) ? metroHost : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const host = Platform.OS === 'web' ? (typeof window !== 'undefined' ? window.location.hostname : 'localhost') : nativeHost;
const configuredUrl = (process.env.EXPO_PUBLIC_API_URL || `http://${host}:4500`).replace(/\/$/, '');
// On a phone, loopback points to the phone, not to the PC running the API.
export const API_URL = Platform.OS === 'web' ? configuredUrl : configuredUrl.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)(?=[:/]|$)/i, `$1${nativeHost}`);
export const api = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 15000 });

// Screens consume the documented envelope's data payload.
api.interceptors.response.use(response => {
  if (response.data?.success === true && Object.prototype.hasOwnProperty.call(response.data, 'data')) response.data = response.data.data;
  return response;
}, async error => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
    await AsyncStorage.multiRemove(['session', 'userId', 'token']);
    router.replace('/login');
  }
  return Promise.reject(error);
});

export function fileUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^(https?:|file:|content:|data:|blob:)/.test(value)) return value;
  return `${API_URL}/${value.replace(/^\//, '')}`;
}

export function normalizePost(post: any) {
  return { ...post,
    user: { id: post.criador?.id ?? post.usuario_id ?? post.id_usuario, nome: post.criador?.nome ?? post.nome, foto: fileUrl(post.criador?.foto_perfil ?? post.foto_perfil) },
    legenda: post.descricao, criado_em: post.data_postagem ?? post.data_criacao, total_likes: Number(post.likes ?? 0),
    imagens: (post.imagens?.length ? post.imagens : post.capa ? [post.capa] : []).map((image: any) => fileUrl(typeof image === 'string' ? image : image.caminho_imagem)),
  };
}

export function apiErrorMessage(error: unknown, fallback = 'Não foi possível concluir. Tente novamente.') {
  if (isAxiosError(error)) {
    if (!error.response) return 'Não foi possível conectar ao servidor. Confira a API e a rede Wi-Fi.';
    return error.response.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function appendImage(form: FormData, field: string, uri: string, filename: string) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    form.append(field, await response.blob(), filename);
  } else {
    form.append(field, { uri, name: filename, type: filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' } as any);
  }
}
