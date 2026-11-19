import { apiErrorMessage } from '@/src/services/api';
import { contactInitial, loadConversationMessages, type Mensagem } from '@/src/services/messaging';
import { messagesApi } from '@/src/services/seek';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
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
    setErroCarregamento(null);
    try {
      const uid = usuarioIdParam || (await AsyncStorage.getItem('userId')) || '';
      setCurrentUserId(uid);

      if (!uid) {
        setMensagens([]);
        return;
      }

      setMensagens(await loadConversationMessages(conversaId, uid));

    } catch (error) {
      console.log('Erro ao carregar mensagens da conversa:', error);
      setErroCarregamento(apiErrorMessage(error));
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
      await messagesApi.send(conversaId, texto);
      setNovaMensagem('');
      await carregarMensagens();
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (error) {
      console.log('Erro ao enviar mensagem:', error);
      Alert.alert('Não foi possível enviar a mensagem', apiErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }, [carregarMensagens, conversaId, currentUserId, novaMensagem, usuarioIdParam]);

  useEffect(() => {
    if (isFocused) void carregarTema();
  }, [carregarTema, isFocused]);

  useEffect(() => {
    if (isFocused) void carregarMensagens();
  }, [carregarMensagens, isFocused]);

  const theme = getAppTheme(darkMode);

  const renderMensagem = ({ item }: { item: Mensagem }) => (
    <View style={[styles.messageRow, item.minha ? styles.messageRowMine : styles.messageRowOther]}>
      {!item.minha ? (
        <View style={[styles.avatar, { backgroundColor: theme.card }]}> 
          {item.remetenteFoto ? (
            <Image source={{ uri: item.remetenteFoto }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarLetter, { color: theme.textPrimary }]}>{contactInitial(item.remetenteNome)}</Text>
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
        ) : erroCarregamento ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Não foi possível carregar a conversa</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{erroCarregamento}</Text>
            <TouchableOpacity onPress={() => void carregarMensagens()} style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.textPrimary }]}>Tentar novamente</Text>
            </TouchableOpacity>
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
            <Icon name="chatbubbles-outline" size={72} color={theme.textMuted} />
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
