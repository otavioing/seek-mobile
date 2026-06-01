import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAppTheme } from '../../../src/theme/appTheme';

type MensagemApi = {
  id: number;
  conversa_id: number;
  remetente_id: number;
  remetente_nome: string;
  remetente_foto: string | null;
  remetente_nome_de_usuario: string | null;
  mensagem: string;
  lida: boolean;
  lida_em: string | null;
  criado_em: string;
};

type Mensagem = {
  id: number;
  texto: string;
  remetenteId: number;
  remetenteNome: string;
  remetenteFoto: string | null;
  hora: string;
  lida: boolean;
  minha: boolean;
};

const formatHora = (dateString?: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function ConversaMensagens() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { id, usuario_id } = useLocalSearchParams<{ id: string | string[]; usuario_id?: string | string[] }>();
  const listRef = useRef<FlatList<Mensagem>>(null);

  const conversaId = useMemo(() => (Array.isArray(id) ? id[0] : id) || '', [id]);
  const usuarioIdParam = useMemo(() => (Array.isArray(usuario_id) ? usuario_id[0] : usuario_id) || '', [usuario_id]);

  const [darkMode, setDarkMode] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregarTema = useCallback(async () => {
    try {
      const temaSalvo = await AsyncStorage.getItem('tema');
      const isDark = temaSalvo !== 'claro';
      setDarkMode(isDark);
    } catch (error) {
      console.log('Erro ao carregar tema:', error);
    }
  }, []);

  const carregarMensagens = useCallback(async () => {
    if (!conversaId) return;

    setCarregando(true);
    try {
      const uid = usuarioIdParam || (await AsyncStorage.getItem('userId')) || '';
      setCurrentUserId(uid);

      if (!uid) {
        setMensagens([]);
        return;
      }

      const { data } = await api.get(`/mensagens/conversas/${conversaId}/mensagens`, {
        params: { usuario_id: uid },
      });

      const lista = Array.isArray(data) ? data : [];
      const mapped: Mensagem[] = lista.map((item: MensagemApi) => ({
        id: item.id,
        texto: item.mensagem,
        remetenteId: item.remetente_id,
        remetenteNome: item.remetente_nome,
        remetenteFoto: item.remetente_foto,
        hora: formatHora(item.criado_em),
        lida: !!item.lida,
        minha: String(item.remetente_id) === String(uid),
      }));

      setMensagens(mapped);

      try {
        await api.put(`/mensagens/conversas/${conversaId}/lidas`, {
          usuario_id: uid,
        });
      } catch (readError) {
        console.log('Erro ao marcar mensagens como lidas:', readError);
      }
    } catch (error) {
      console.log('Erro ao carregar mensagens da conversa:', error);
      setMensagens([]);
    } finally {
      setCarregando(false);
    }
  }, [conversaId, usuarioIdParam]);

  const enviarMensagem = useCallback(async () => {
    const texto = novaMensagem.trim();
    if (!texto || !conversaId) return;

    if (!currentUserId) {
      const uid = usuarioIdParam || (await AsyncStorage.getItem('userId')) || '';
      if (!uid) {
        return;
      }
      setCurrentUserId(uid);
    }

    const remetenteId = currentUserId || usuarioIdParam || (await AsyncStorage.getItem('userId')) || '';
    if (!remetenteId) return;

    setEnviando(true);
    try {
      await api.post(`/mensagens/conversas/${conversaId}/mensagens`, {
        remetente_id: Number(remetenteId),
        mensagem: texto,
      });
      setNovaMensagem('');
      await carregarMensagens();
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (error) {
      console.log('Erro ao enviar mensagem:', error);
    } finally {
      setEnviando(false);
    }
  }, [carregarMensagens, conversaId, currentUserId, novaMensagem, usuarioIdParam]);

  useEffect(() => {
    void carregarTema();
  }, [carregarTema, isFocused]);

  useEffect(() => {
    void carregarMensagens();
  }, [carregarMensagens, isFocused]);

  const theme = getAppTheme(darkMode);

  const renderMensagem = ({ item }: { item: Mensagem }) => (
    <View style={[styles.messageRow, item.minha ? styles.messageRowMine : styles.messageRowOther]}>
      {!item.minha ? (
        <View style={[styles.avatar, { backgroundColor: theme.card }]}> 
          {item.remetenteFoto ? (
            <Image source={{ uri: item.remetenteFoto }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarLetter, { color: theme.textPrimary }]}>{item.remetenteNome.slice(0, 1)}</Text>
          )}
        </View>
      ) : null}

      <View style={[styles.bubble, item.minha ? [styles.bubbleMine, { backgroundColor: '#2563EB' }] : [styles.bubbleOther, { backgroundColor: theme.card }]]}>
        {!item.minha ? <Text style={[styles.senderName, { color: theme.textSecondary }]}>{item.remetenteNome}</Text> : null}
        <Text style={[styles.messageText, { color: item.minha ? '#FFFFFF' : theme.textPrimary }]}>{item.texto}</Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, { color: item.minha ? 'rgba(255,255,255,0.75)' : theme.textSecondary }]}>{item.hora}</Text>
          {item.minha ? <Icon name={item.lida ? 'checkmark-done' : 'checkmark-outline'} size={15} color="rgba(255,255,255,0.8)" /> : null}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
            <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Conversa</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>ID {conversaId}</Text>
        </View>

        {carregando ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={theme.textPrimary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Carregando mensagens...</Text>
          </View>
        ) : mensagens.length > 0 ? (
          <FlatList
            ref={listRef}
            data={mensagens}
            renderItem={renderMensagem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="chatbubbles-outline" size={72} color={theme.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Sem mensagens</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Essa conversa ainda não tem mensagens.</Text>
          </View>
        )}
        <View style={[styles.composer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <TextInput
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            placeholder="Digite sua mensagem"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.card }]}
            multiline
          />
          <TouchableOpacity
            onPress={enviarMensagem}
            disabled={!novaMensagem.trim() || enviando}
            style={[styles.sendButton, { backgroundColor: novaMensagem.trim() ? '#2563EB' : theme.card }]}
          >
            {enviando ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backIcon: {
    marginRight: 0,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '700',
  },
  titleBlock: {
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 6,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});