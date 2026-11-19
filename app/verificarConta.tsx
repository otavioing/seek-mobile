import { api } from '@/src/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
export default function VerificarConta() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || '');
  const [codigo, setCodigo] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async (resend = false) => {
    if (busy) return;
    setBusy(true);
    try {
      await api.post(resend ? '/usuarios/reenviar-codigo' : '/usuarios/verificar-codigo', { email: email.trim(), codigo });
      Alert.alert('Sucesso', resend ? 'Novo código enviado ao seu e-mail.' : 'Conta ativada. Faça login para continuar.');
      if (!resend) router.replace('/login');
    } catch (e: any) { Alert.alert('Erro', e.response?.data?.message || 'Não foi possível conectar ao servidor.'); }
    finally { setBusy(false); }
  };
  return <View style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 18, backgroundColor: '#fff' }}>
    <Text style={{ fontSize: 26, fontWeight: 'bold' }}>Ativar minha conta</Text>
    <Text>Informe o código de seis dígitos recebido por e-mail.</Text>
    <TextInput accessibilityLabel="E-mail" placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderRadius: 8, padding: 14 }} />
    <TextInput accessibilityLabel="Código de ativação" placeholder="Código de ativação" keyboardType="number-pad" maxLength={6} value={codigo} onChangeText={setCodigo} style={{ borderWidth: 1, borderRadius: 8, padding: 14 }} />
    <TouchableOpacity disabled={busy || codigo.length !== 6} onPress={() => send()}><Text style={{ color: '#322BF0', fontSize: 18 }}>Confirmar código</Text></TouchableOpacity>
    <TouchableOpacity disabled={busy} onPress={() => send(true)}><Text>Reenviar código</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace('/login')}><Text>Voltar ao login</Text></TouchableOpacity>
  </View>;
}
