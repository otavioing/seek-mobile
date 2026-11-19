import { apiErrorMessage } from '@/src/services/api';
import { isValidDate, jobsApi } from '@/src/services/seek';
import { getAppTheme } from '@/src/theme/appTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FiltrarV() {
  const params = useLocalSearchParams<{ categoria?: string; inicio?: string; fim?: string; minhas?: string }>();
  const [category, setCategory] = useState(params.categoria || '');
  const [start, setStart] = useState(params.inicio || '');
  const [end, setEnd] = useState(params.fim || '');
  const [mine, setMine] = useState(params.minhas === '1');
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const theme = getAppTheme(dark);
  useEffect(() => {
    AsyncStorage.getItem('tema').then(value => setDark(value === 'escuro'));
    jobsApi.popularCategories().then(({ data }) => setCategories(data)).catch(e => setError(apiErrorMessage(e)));
  }, []);
  const apply = () => {
    if ((start || end) && (!isValidDate(start) || !isValidDate(end) || start > end)) {
      setError('Informe as duas datas válidas no formato AAAA-MM-DD, com início até o fim.'); return;
    }
    router.replace({ pathname: '/vagas', params: { categoria: category.trim(), inicio: start, fim: end, minhas: mine ? '1' : '' } });
  };
  return <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 24, gap: 22 }} keyboardShouldPersistTaps="handled">
    <TouchableOpacity onPress={() => router.back()}><Text style={{ color: theme.link }}>Voltar</Text></TouchableOpacity>
    <Text style={{ fontSize: 26, fontWeight: 'bold', color: theme.textPrimary }}>Filtrar vagas</Text>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#dc2626' }}>{error}</Text>}
    <Text style={{ color: theme.textPrimary }}>Categoria</Text>
    <TextInput accessibilityLabel="Categoria da vaga" value={category} onChangeText={setCategory} placeholder="Todas as categorias" placeholderTextColor={theme.textMuted} style={{ color: theme.textPrimary, padding: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 8 }} />
    {categories.map(item => <TouchableOpacity key={item.id} onPress={() => setCategory(item.nome)}><Text style={{ color: category === item.nome ? theme.link : theme.textPrimary }}>{item.nome} ({item.quantidade_vagas})</Text></TouchableOpacity>)}
    {[{ label: 'Data inicial (AAAA-MM-DD)', value: start, change: setStart }, { label: 'Data final (AAAA-MM-DD)', value: end, change: setEnd }].map(field => <View key={field.label} style={{ gap: 8 }}><Text style={{ color: theme.textPrimary }}>{field.label}</Text><TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.change} placeholder="2026-11-19" placeholderTextColor={theme.textMuted} maxLength={10} style={{ color: theme.textPrimary, padding: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 8 }} /></View>)}
    <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: mine }} onPress={() => setMine(!mine)}><Text style={{ color: theme.textPrimary }}>{mine ? '✓ ' : ''}Somente vagas publicadas por mim</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" onPress={apply} style={{ padding: 16, borderRadius: 8, backgroundColor: '#322bf0' }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Aplicar filtros</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace({ pathname: '/vagas', params: { categoria: '', inicio: '', fim: '', minhas: '' } })}><Text style={{ color: theme.link, textAlign: 'center' }}>Limpar filtros</Text></TouchableOpacity>
  </ScrollView>;
}
