import { apiErrorMessage } from '@/src/services/api';
import { postsApi } from '@/src/services/seek';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

export default function SavePostButton({ postId }: { postId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setBusy(true);
    postsApi.detail(postId).then(({ data }) => {
      if (active) { setSaved(Boolean(data.usuario_salvou)); setError(''); }
    }).catch(e => { if (active) setError(apiErrorMessage(e)); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [postId]);
  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (error) {
        const { data } = await postsApi.detail(postId);
        setSaved(Boolean(data.usuario_salvou)); setError('');
      } else {
        await (saved ? postsApi.unsave(postId) : postsApi.save(postId));
        setSaved(!saved);
      }
    } catch (e) { Alert.alert('Não foi possível salvar o projeto', apiErrorMessage(e)); }
    finally { setBusy(false); }
  };
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={error ? 'Recarregar projeto salvo' : saved ? 'Remover projeto dos salvos' : 'Salvar projeto'} disabled={busy} onPress={toggle} style={{ padding: 10, borderRadius: 24, backgroundColor: '#1119', opacity: busy ? 0.5 : 1 }}>
    <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? '#818cf8' : '#fff'} />
  </TouchableOpacity>;
}
