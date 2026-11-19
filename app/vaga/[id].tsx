import { apiErrorMessage } from '@/src/services/api';
import { jobsApi } from '@/src/services/seek';
import { getAppTheme } from '@/src/theme/appTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function VagaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const theme = getAppTheme(dark);
  useEffect(() => {
    let active = true;
    setBusy(true);
    AsyncStorage.getItem('tema').then(value => setDark(value === 'escuro'));
    Promise.all([jobsApi.detail(id), jobsApi.favorites()]).then(([detail, favorites]) => {
      if (active) { setJob(detail.data); setFavorite(favorites.data.some((item: any) => String(item.id) === id)); setError(''); }
    }).catch(e => { if (active) setError(apiErrorMessage(e)); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [id]);
  const toggle = async () => {
    setBusy(true);
    try { await (favorite ? jobsApi.unfavorite(id) : jobsApi.favorite(id)); setFavorite(!favorite); }
    catch (e) { setError(apiErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const openLink = async () => {
    if (!/^https?:\/\//i.test(job.link_linkedin || '')) { setError('O link desta vaga não é válido.'); return; }
    try { await Linking.openURL(job.link_linkedin); } catch { setError('Não foi possível abrir o link da vaga.'); }
  };
  return <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 24, gap: 22 }}>
    <TouchableOpacity onPress={() => router.back()}><Text style={{ color: theme.link }}>Voltar</Text></TouchableOpacity>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#dc2626' }}>{error}</Text>}
    {busy && <ActivityIndicator />}
    {job && <>
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: theme.textPrimary }}>{job.titulo}</Text>
      <TouchableOpacity onPress={() => router.push(`/usuario/${job.id_empresa}` as any)}><Text style={{ color: theme.link }}>{job.empresa_nome}</Text></TouchableOpacity>
      <Text style={{ color: theme.textMuted }}>{job.categorias?.map((item: any) => item.nome).join(', ')}</Text>
      <Text style={{ color: theme.textPrimary, lineHeight: 24 }}>{job.descricao}</Text>
      <View style={{ gap: 22 }}><TouchableOpacity accessibilityRole="button" disabled={busy} onPress={toggle}><Text style={{ color: theme.link }}>{favorite ? 'Remover dos favoritos' : 'Favoritar vaga'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="link" onPress={openLink}><Text style={{ color: theme.link }}>Candidatar-se no site da vaga</Text></TouchableOpacity></View>
    </>}
  </ScrollView>;
}
