import { apiErrorMessage, fileUrl } from '@/src/services/api';
import { usersApi } from '@/src/services/seek';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAppTheme } from '@/src/theme/appTheme';

export default function Pesquisar() {
  const params = useLocalSearchParams<{ termo?: string }>();
  const [term, setTerm] = useState(params.termo || '');
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const request = useRef(0);
  const theme = getAppTheme(dark);
  const loadHistory = useCallback(async () => {
    try { const { data } = await usersApi.searchHistory(); setHistory(data); }
    catch (e) { setError(apiErrorMessage(e)); }
  }, []);
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('tema').then(value => setDark(value === 'escuro'));
    void loadHistory();
    return () => { request.current++; };
  }, [loadHistory]));
  const search = useCallback(async (value: string) => {
    const query = value.trim();
    if (!query) return;
    const current = ++request.current;
    setTerm(query); setLoading(true); setError(''); setSearched(true);
    try {
      const { data } = await usersApi.search(query);
      if (current === request.current) { setUsers(data); void loadHistory(); }
    } catch (e) { if (current === request.current) { setError(apiErrorMessage(e)); setUsers([]); } }
    finally { if (current === request.current) setLoading(false); }
  }, [loadHistory]);
  useEffect(() => {
    if (params.termo?.trim()) void search(params.termo);
  }, [params.termo, search]);
  const removeHistory = async (id: number) => {
    try { await usersApi.deleteSearch(id); await loadHistory(); }
    catch (e) { setError(apiErrorMessage(e)); }
  };
  return <View style={[styles.screen, { backgroundColor: theme.background }]}>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.back()}><Text style={{ color: theme.link }}>Voltar</Text></TouchableOpacity>
    <Text style={[styles.title, { color: theme.textPrimary }]}>Buscar pessoas e empresas</Text>
    <View style={styles.row}>
      <TextInput accessibilityLabel="Nome ou e-mail" value={term} onChangeText={setTerm} onSubmitEditing={() => search(term)} returnKeyType="search" placeholder="Nome ou e-mail" placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]} />
      <TouchableOpacity accessibilityRole="button" onPress={() => search(term)} disabled={loading}><Text style={{ color: theme.link }}>Buscar</Text></TouchableOpacity>
    </View>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#dc2626' }}>{error}</Text>}
    {!!history.length && <View style={{ gap: 12 }}>
      <Text style={{ color: theme.textMuted }}>Pesquisas recentes</Text>
      {history.map(item => <View key={item.id} style={styles.row}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => search(item.termo)}><Text style={{ color: theme.textPrimary }}>{item.termo}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`Remover pesquisa ${item.termo}`} onPress={() => removeHistory(item.id)}><Text style={{ color: theme.textMuted }}>Remover</Text></TouchableOpacity>
      </View>)}
    </View>}
    {loading && <ActivityIndicator />}
    <FlatList data={users} keyExtractor={item => String(item.id)} ListEmptyComponent={!loading && searched ? <Text style={{ color: theme.textMuted }}>Nenhum usuário encontrado.</Text> : null} renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" onPress={() => router.push(`/usuario/${item.id}` as any)} style={[styles.user, { borderColor: theme.border }]}>
      <Image source={item.foto_perfil ? { uri: fileUrl(item.foto_perfil)! } : require('../assets/images/default-avatar.png')} style={styles.avatar} />
      <View><Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{item.nome}</Text><Text style={{ color: theme.textMuted }}>{item.tipo_usuario === 'EMPRESA' ? 'Empresa' : 'Pessoa física'}</Text></View>
    </TouchableOpacity>} />
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, padding: 22, gap: 20 }, title: { fontSize: 24, fontWeight: 'bold' }, row: { flexDirection: 'row', alignItems: 'center', gap: 16 }, input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12 }, user: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1 }, avatar: { width: 48, height: 48, borderRadius: 24 } });
