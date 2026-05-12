import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, TextInput } from "react-native";

type PerfilVisibilidade = "Público" | "Privado";
type ListaOpcao = "Todos" | "Seguidores" | "Seguindo";

export default function Privacidade() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);
  const [perfilVisibilidade, setPerfilVisibilidade] = useState<PerfilVisibilidade>("Público");
  const [quemVePosts, setQuemVePosts] = useState<ListaOpcao>("Seguidores");
  const [quemVePostsAberto, setQuemVePostsAberto] = useState(false);
  const [quemComenta, setQuemComenta] = useState<ListaOpcao>("Seguindo");
  const [quemComentaAberto, setQuemComentaAberto] = useState(false);

  // ESTADOS PARA MODAIS DE LISTA
  const [usuariosBloqueadosAberto, setUsuariosBloqueadosAberto] = useState(false);
  const [palavrasBloqueadasAberto, setPalavrasBloqueadasAberto] = useState(false);

  // ESTADOS DE PALAVRAS
  const [palavras, setPalavras] = useState(["Arruma outro emprego", "Boboca", "Babaca", "Idiota", "Chato", "Feio", "Muito ruim"]);
  const [novaPalavra, setNovaPalavra] = useState("");
  const [confirmacaoExcluirAberto, setConfirmacaoExcluirAberto] = useState(false);
  const [palavraParaExcluir, setPalavraParaExcluir] = useState<string | null>(null);

  // ESTADOS DE USUÁRIOS (Novo: gerencia a lista e confirmação)
  const [usuarios, setUsuarios] = useState([{ id: '1', nome: 'Nome do usuário' }]);
  const [usuarioParaDesbloquear, setUsuarioParaDesbloquear] = useState<string | null>(null);
  const [confirmacaoDesbloqueioAberto, setConfirmacaoDesbloqueioAberto] = useState(false);

  const carregarTema = useCallback(async () => {
    try {
      const temaSalvo = await AsyncStorage.getItem("tema");
      const isDark = temaSalvo !== "claro";
      setDarkMode(isDark);
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    }
  }, []);

  useEffect(() => { carregarTema(); }, [carregarTema]);
  useFocusEffect(useCallback(() => { carregarTema(); }, [carregarTema]));

  const theme = darkMode
    ? { background: "#121212", textPrimary: "#FFFFFF", textSecondary: "#888888", pillBackground: "#1F1F1F", card: "#1A1A1A" }
    : { background: "#FFFFFF", textPrimary: "#000000", textSecondary: "#666666", pillBackground: "#EFEFEF", card: "#F5F5F5" };

  const confirmarExclusaoPalavra = () => {
    setPalavras(palavras.filter(p => p !== palavraParaExcluir));
    setConfirmacaoExcluirAberto(false);
    setPalavraParaExcluir(null);
  };

  const confirmarDesbloqueioUsuario = () => {
    setUsuarios(usuarios.filter(u => u.id !== usuarioParaDesbloquear));
    setConfirmacaoDesbloqueioAberto(false);
    setUsuarioParaDesbloquear(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Privacidade</Text>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Perfil</Text>
          <TouchableOpacity style={[styles.pill, { backgroundColor: theme.pillBackground }]} onPress={() => setPerfilVisibilidade(prev => prev === "Público" ? "Privado" : "Público")}>
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{perfilVisibilidade}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Quem pode ver meus posts?</Text>
          <TouchableOpacity style={[styles.pill, { backgroundColor: theme.pillBackground }]} onPress={() => setQuemVePostsAberto(!quemVePostsAberto)}>
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{quemVePosts}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Quem pode comentar</Text>
          <TouchableOpacity style={[styles.pill, { backgroundColor: theme.pillBackground }]} onPress={() => setQuemComentaAberto(!quemComentaAberto)}>
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{quemComenta}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.row} onPress={() => setUsuariosBloqueadosAberto(true)}>
          <Text style={[styles.label, styles.boldLabel, { color: theme.textPrimary }]}>Usuários bloqueados</Text>
          <Ionicons name="chevron-down" size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => setPalavrasBloqueadasAberto(true)}>
          <Text style={[styles.label, styles.boldLabel, { color: theme.textPrimary }]}>Palavras bloqueadas</Text>
          <Ionicons name="chevron-down" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* DROPDOWN QUEM VÊ/COMENTA */}
      <Modal visible={quemVePostsAberto || quemComentaAberto} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => { setQuemVePostsAberto(false); setQuemComentaAberto(false); }}>
          <View style={[styles.dropdownMenu, { backgroundColor: theme.card, top: quemVePostsAberto ? 230 : 280 }]}>
            {(quemVePostsAberto ? ["Todos", "Seguidores"] : ["Todos", "Seguindo"]).map((opcao) => (
              <TouchableOpacity key={opcao} style={styles.dropdownItem} onPress={() => {
                if (quemVePostsAberto) setQuemVePosts(opcao as ListaOpcao);
                else setQuemComenta(opcao as ListaOpcao);
                setQuemVePostsAberto(false); setQuemComentaAberto(false);
              }}>
                <Text style={{ color: theme.textPrimary }}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* MODAL: USUÁRIOS BLOQUEADOS */}
      <Modal visible={usuariosBloqueadosAberto} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setUsuariosBloqueadosAberto(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Usuários bloqueados</Text>
            {usuarios.map(user => (
              <View key={user.id} style={styles.userRow}>
                <View style={styles.avatarPlaceholder} />
                <View>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{user.nome}</Text>
                  <TouchableOpacity onPress={() => {
                    setUsuarioParaDesbloquear(user.id);
                    setConfirmacaoDesbloqueioAberto(true);
                  }}>
                    <Text style={{ color: '#FF4444', fontSize: 12 }}>Desbloquear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL: PALAVRAS BLOQUEADAS */}
      <Modal visible={palavrasBloqueadasAberto} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setPalavrasBloqueadasAberto(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Palavras bloqueadas</Text>
            <TextInput
              style={styles.wordInput}
              placeholderTextColor="#666"
              placeholder="Adicionar palavra..."
              value={novaPalavra}
              onChangeText={setNovaPalavra}
              onSubmitEditing={() => {
                if (novaPalavra.trim()) {
                  setPalavras([...palavras, novaPalavra.trim()]);
                  setNovaPalavra("");
                }
              }}
            />
            <View style={styles.wordsContainer}>
              {palavras.map(p => (
                <TouchableOpacity key={p} style={styles.wordPill} onPress={() => {
                  setPalavraParaExcluir(p);
                  setConfirmacaoExcluirAberto(true);
                }}>
                  <Text style={styles.wordPillText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL CONFIRMAÇÃO: TIRAR PALAVRA */}
      <Modal visible={confirmacaoExcluirAberto} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.confirmCard, { backgroundColor: theme.card }]}>
            <Text style={styles.confirmTitle}>Deseja tirar a palavra?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity onPress={confirmarExclusaoPalavra}><Text style={styles.btnTextConfirm}>Sim</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmacaoExcluirAberto(false)}><Text style={styles.btnTextConfirm}>Não</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CONFIRMAÇÃO: DESBLOQUEAR USUÁRIO (Novo) */}
      <Modal visible={confirmacaoDesbloqueioAberto} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.confirmCard, { backgroundColor: theme.card }]}>
            <Text style={styles.confirmTitle}>Deseja desbloquear este usuário?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity onPress={confirmarDesbloqueioUsuario}><Text style={styles.btnTextConfirm}>Sim</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmacaoDesbloqueioAberto(false)}><Text style={styles.btnTextConfirm}>Não</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 22 },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 30 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
  label: { fontSize: 16, flex: 1, fontWeight: '500' },
  boldLabel: { fontWeight: "bold" },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  pillText: { fontSize: 14, fontWeight: "500" },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { position: 'absolute', right: 20, width: 130, borderRadius: 12, padding: 8, elevation: 10 },
  dropdownItem: { padding: 12 },
  modalCard: { width: '85%', padding: 20, borderRadius: 16, maxHeight: '70%' },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2563eb', marginRight: 12 },
  wordInput: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 15, color: '#000' },
  wordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordPill: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  wordPillText: { color: '#000', fontWeight: '600' },
  confirmCard: { width: '75%', padding: 22, borderRadius: 12 },
  confirmTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 30 },
  confirmButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 25 },
  btnTextConfirm: { color: '#FFF', fontSize: 15, fontWeight: 'bold' }
});