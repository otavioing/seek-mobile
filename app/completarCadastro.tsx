import { apiErrorMessage, fileUrl } from '@/src/services/api';
import { pickPdf } from '@/src/services/documentPicker';
import { completeFirstLogin, ProfileData, SessionUser, validateUser, WelcomeFields, welcomeFields } from '@/src/services/onboarding';
import { authApi, usersApi } from '@/src/services/seek';
import type { UploadFile } from '@/src/services/uploads';
import { getAppTheme } from '@/src/theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const personInputs = [
  { key: 'nome_usuario', label: 'Nome de usuário', placeholder: 'Como você quer ser encontrado', autoCapitalize: 'none' as const },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/seu-perfil', autoCapitalize: 'none' as const },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/seu-perfil', autoCapitalize: 'none' as const },
];
const companyInputs = [
  { key: 'nome_fantasia', label: 'Nome da empresa', placeholder: 'Nome fantasia', autoCapitalize: 'words' as const },
  { key: 'categoria_negocio', label: 'Categoria de negócio', placeholder: 'Ex.: Design, tecnologia, educação', autoCapitalize: 'sentences' as const },
  { key: 'razao_social', label: 'Razão social', placeholder: 'Razão social da empresa', autoCapitalize: 'words' as const },
  { key: 'numero_funcionarios', label: 'Número de funcionários', placeholder: 'Ex.: 10', autoCapitalize: 'none' as const },
  { key: 'telefone_comercial', label: 'Telefone', placeholder: '(00) 00000-0000', autoCapitalize: 'none' as const },
  { key: 'site', label: 'Site', placeholder: 'https://suaempresa.com', autoCapitalize: 'none' as const },
];

export default function CompletarCadastro() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fields, setFields] = useState<WelcomeFields>({});
  const [photo, setPhoto] = useState<UploadFile | null>(null);
  const [curriculum, setCurriculum] = useState<UploadFile | null>(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  const saveLock = useRef(false);
  const theme = getAppTheme(dark);
  const company = profile?.tipo_usuario === 'EMPRESA';
  const busy = saving || picking;

  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true); setError('');
    try {
      const [identity, profiles] = await Promise.all([authApi.me(), usersApi.profiles()]);
      const currentUser = identity.data?.usuario;
      validateUser(currentUser);
      if (profiles.data?.tipo_usuario !== currentUser.tipo_usuario || String(profiles.data?.id) !== String(currentUser.id)) throw new Error('Não foi possível carregar o perfil desta conta. Tente novamente.');
      if (current === request.current) {
        setUser(currentUser); setProfile(profiles.data); setFields(welcomeFields(profiles.data));
      }
    } catch (e) { if (current === request.current) setError(apiErrorMessage(e)); }
    finally { if (current === request.current) setLoading(false); }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('tema').then(value => setDark(value === 'escuro')).catch(() => undefined);
    void load();
    const state = request;
    return () => { state.current++; };
  }, [load]);
  useEffect(() => () => {
    if (Platform.OS === 'web' && curriculum?.uri.startsWith('blob:')) URL.revokeObjectURL(curriculum.uri);
  }, [curriculum]);

  const selectPhoto = async () => {
    if (busy) return;
    setPicking(true); setError('');
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) throw new Error('Permita o acesso à galeria para escolher sua foto.');
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType === 'image/jpg' ? 'image/jpeg' : asset.mimeType || 'image/jpeg';
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) throw new Error('Selecione uma foto JPG, PNG ou WebP.');
        setPhoto({ uri: asset.uri, name: `perfil.${mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'}`, mimeType, size: asset.fileSize });
      }
    } catch (e) { setError(apiErrorMessage(e)); }
    finally { setPicking(false); }
  };

  const selectCurriculum = async () => {
    if (busy) return;
    setPicking(true); setError('');
    try { const selected = await pickPdf(); if (selected) setCurriculum(selected); }
    catch (e) { setError(apiErrorMessage(e)); }
    finally { setPicking(false); }
  };

  const save = async () => {
    if (!profile || saveLock.current || picking) return;
    saveLock.current = true; setSaving(true); setError('');
    try {
      await completeFirstLogin({ profile, fields, photo, curriculum });
      router.replace('/principal');
    } catch (e) { setError(apiErrorMessage(e)); }
    finally { saveLock.current = false; setSaving(false); }
  };

  const logout = async () => {
    if (busy) return;
    setSaving(true);
    try { await authApi.logout(); } catch { /* The local session is cleared even if it has expired. */ }
    finally {
      await AsyncStorage.multiRemove(['session', 'userId', 'token']);
      router.replace('/login'); setSaving(false);
    }
  };

  const avatar = photo?.uri || fileUrl(user?.foto_perfil);
  const descriptionKey = company ? 'descricao' : 'sobre';
  return <KeyboardAvoidingView style={[styles.screen, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Image source={dark ? require('../assets/images/logo_seek_letrabranca.png') : require('../assets/images/logo_seek_letrapreta.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={logout}><Text style={{ color: theme.textSecondary }}>Sair da conta</Text></TouchableOpacity>
      </View>
      <Text style={[styles.eyebrow, { color: theme.link }]}>SEU PRIMEIRO ACESSO</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Bem-vindo(a){user?.nome ? `, ${user.nome.split(' ')[0]}` : ''}!</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Antes de prosseguir, complete {company ? 'o perfil da sua empresa' : 'seu perfil'}. Você pode editar estas informações depois.</Text>
      {!!error && <View style={[styles.errorBox, { borderColor: theme.danger }]}><Text accessibilityRole="alert" style={{ color: theme.danger }}>{error}</Text></View>}
      {loading ? <ActivityIndicator style={{ padding: 28 }} color={theme.link} /> : !profile ? <TouchableOpacity accessibilityRole="button" onPress={load} style={[styles.outlineButton, { borderColor: theme.border }]}><Text style={{ color: theme.link }}>Tentar novamente</Text></TouchableOpacity> : <>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{company ? 'Perfil da empresa' : 'Seu perfil'}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Adicionar foto de perfil" disabled={busy} onPress={selectPhoto} style={styles.photoRow}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Ionicons name="camera-outline" size={32} color={theme.textMuted} />}
              <View style={styles.photoBadge}><Ionicons name="add" size={17} color="#fff" /></View>
            </View>
            <View style={{ flex: 1, gap: 5 }}><Text style={{ color: theme.link, fontWeight: '600' }}>{avatar ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}</Text><Text style={{ color: theme.textMuted, fontSize: 13 }}>JPG, PNG ou WebP · opcional</Text></View>
          </TouchableOpacity>
          {(company ? companyInputs : personInputs).map(field => <View key={field.key} style={styles.field}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{field.label}</Text>
            <TextInput accessibilityLabel={field.label} editable={!busy} value={fields[field.key] || ''} onChangeText={value => setFields(previous => ({ ...previous, [field.key]: value }))} placeholder={field.placeholder} placeholderTextColor={theme.textMuted} autoCapitalize={field.autoCapitalize} autoCorrect={!['site', 'linkedin', 'github', 'nome_usuario'].includes(field.key)} keyboardType={field.key === 'numero_funcionarios' ? 'number-pad' : field.key === 'telefone_comercial' ? 'phone-pad' : ['site', 'linkedin', 'github'].includes(field.key) ? 'url' : 'default'} style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.backgroundAlt, borderColor: theme.border }]} />
          </View>)}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Descrição</Text>
            <TextInput accessibilityLabel={company ? 'Descrição da empresa' : 'Sobre você'} editable={!busy} multiline textAlignVertical="top" value={fields[descriptionKey] || ''} onChangeText={value => setFields(previous => ({ ...previous, [descriptionKey]: value }))} placeholder={company ? 'Descreva sua empresa...' : 'Fale sobre você, sua profissão e seus projetos...'} placeholderTextColor={theme.textMuted} style={[styles.input, styles.description, { color: theme.textPrimary, backgroundColor: theme.backgroundAlt, borderColor: theme.border }]} />
          </View>
        </View>
        {!company && <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Currículo</Text>
          <Text style={{ color: theme.textSecondary }}>Anexe seu currículo em PDF, se desejar.</Text>
          <TouchableOpacity accessibilityRole="button" onPress={selectCurriculum} disabled={busy} style={[styles.outlineButton, { borderColor: theme.border }]}><Ionicons name="document-attach-outline" size={22} color={theme.link} /><Text style={{ color: theme.link, fontWeight: '600' }}>Anexar currículo (.pdf)</Text></TouchableOpacity>
          <Text numberOfLines={2} style={{ color: theme.textMuted }}>{curriculum?.name || (profile.perfil_pessoa_fisica?.curriculo ? 'Currículo atual já anexado' : 'Nenhum arquivo selecionado')}</Text>
          {!!curriculum && <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setCurriculum(null)}><Text style={{ color: theme.textMuted }}>Remover seleção</Text></TouchableOpacity>}
        </View>}
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={save} style={[styles.primaryButton, { opacity: busy ? 0.6 : 1 }]}>
          {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={21} color="#fff" />}<Text style={styles.primaryText}>{saving ? 'Concluindo cadastro...' : picking ? 'Selecionando arquivo...' : 'Concluir e entrar'}</Text>
        </TouchableOpacity>
      </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { padding: 24, paddingBottom: 48, gap: 18, width: '100%', maxWidth: 620, alignSelf: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, logo: { width: 92, height: 38 },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, fontWeight: '700' }, title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.7 }, subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  card: { borderRadius: 18, borderWidth: 1, padding: 20, gap: 20 }, sectionTitle: { fontSize: 19, fontWeight: '700' },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 4 }, avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }, avatarImage: { width: 78, height: 78, borderRadius: 39 }, photoBadge: { position: 'absolute', right: -2, bottom: 1, backgroundColor: '#322bf0', borderRadius: 16, padding: 5 },
  field: { gap: 8 }, label: { fontSize: 14, fontWeight: '600' }, input: { borderRadius: 10, borderWidth: 1, padding: 13, fontSize: 15, minHeight: 48 }, description: { minHeight: 115 },
  outlineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, borderWidth: 1, borderRadius: 10 }, primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#322bf0', padding: 18, borderRadius: 12, marginTop: 6 }, primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' }, errorBox: { padding: 14, borderWidth: 1, borderRadius: 10 },
});
