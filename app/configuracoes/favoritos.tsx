import { apiErrorMessage } from '@/src/services/api';
import { jobsApi, postsApi } from '@/src/services/seek';
import { getAppTheme } from '@/src/theme/appTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'vagas' | 'salvos' | 'curtidos';
const tabs: { key: Tab; label: string }[] = [{ key: 'vagas', label: 'Vagas favoritas' }, { key: 'salvos', label: 'Projetos salvos' }, { key: 'curtidos', label: 'Curtidos' }];
export default function Favoritos() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('vagas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const request = useRef(0);
  const theme = getAppTheme(dark);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true); setError(''); setItems([]);
    try {
      const { data } = await (tab === 'vagas' ? jobsApi.favorites() : tab === 'salvos' ? postsApi.saved() : postsApi.liked());
      if (current === request.current) setItems(data);
    } catch (e) { if (current === request.current) setError(apiErrorMessage(e)); }
    finally { if (current === request.current) setLoading(false); }
  }, [tab]);
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('tema').then(value => setDark(value === 'escuro'));
    void load();
    return () => { request.current++; };
  }, [load]));
  const remove = async (id: number) => {
    try {
      await (tab === 'vagas' ? jobsApi.unfavorite(id) : tab === 'salvos' ? postsApi.unsave(id) : postsApi.unlike(id));
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (e) { setError(apiErrorMessage(e)); }
  };
  return <View style={{ flex: 1, padding: 22, backgroundColor: theme.background, gap: 20 }}>
    <TouchableOpacity onPress={() => router.back()}><Text style={{ color: theme.link }}>Voltar</Text></TouchableOpacity>
    <Text style={{ fontSize: 26, fontWeight: 'bold', color: theme.textPrimary }}>Favoritos e curtidos</Text>
    <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>{tabs.map(item => <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: tab === item.key }} key={item.key} onPress={() => setTab(item.key)}><Text style={{ color: tab === item.key ? theme.link : theme.textMuted }}>{item.label}</Text></TouchableOpacity>)}</View>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#dc2626' }}>{error}</Text>}
    <FlatList data={items} refreshing={loading} onRefresh={load} keyExtractor={item => String(item.id)} ListEmptyComponent={!loading ? <Text style={{ color: theme.textMuted }}>Nenhum item nesta lista.</Text> : null} renderItem={({ item }) => <View style={{ paddingVertical: 18, gap: 12, borderBottomWidth: 1, borderColor: theme.border }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textPrimary }}>{item.titulo}</Text>
      <Text numberOfLines={4} style={{ color: theme.textPrimary }}>{item.descricao}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push((tab === 'vagas' ? `/vaga/${item.id}` : `/projeto/${item.id}`) as any)}><Text style={{ color: theme.link }}>Abrir {tab === 'vagas' ? 'vaga' : 'projeto'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={() => remove(item.id)}><Text style={{ color: theme.textMuted }}>{tab === 'curtidos' ? 'Remover curtida' : 'Remover dos favoritos'}</Text></TouchableOpacity>
    </View>} />
  </View>;
}
