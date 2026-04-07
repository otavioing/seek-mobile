import Breadcrumb from "@/components/Breadcrumb";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PerfilVisibilidade = "Público" | "Privado";
type ListaOpcao = "Todos" | "Seguidores" | "Seguindo";

export default function Privacidade() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [perfilVisibilidade, setPerfilVisibilidade] = useState<PerfilVisibilidade>("Público");

  const [quemVePosts, setQuemVePosts] = useState<ListaOpcao>("Todos");
  const [quemVePostsAberto, setQuemVePostsAberto] = useState(false);

  const [quemComenta, setQuemComenta] = useState<ListaOpcao>("Todos");
  const [quemComentaAberto, setQuemComentaAberto] = useState(false);

  const [usuariosBloqueadosAberto, setUsuariosBloqueadosAberto] = useState(false);
  const [palavrasBloqueadasAberto, setPalavrasBloqueadasAberto] = useState(false);

  const carregarTema = useCallback(async () => {
    try {
      const temaSalvo = await AsyncStorage.getItem("tema");
      const isDark = temaSalvo !== "claro";
      setDarkMode(isDark);

      if (!temaSalvo) {
        await AsyncStorage.setItem("tema", "escuro");
      }
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    }
  }, []);

  useEffect(() => {
    carregarTema();
  }, [carregarTema]);

  useFocusEffect(
    useCallback(() => {
      carregarTema();
    }, [carregarTema])
  );

  const theme = darkMode
    ? {
        background: "#000000",
        textPrimary: "#FFFFFF",
        pillBackground: "#1F1F1F",
        dropdownBackground: "#111111",
      }
    : {
        background: "#D9D9D9",
        textPrimary: "#111111",
        pillBackground: "#FFFFFF",
        dropdownBackground: "#EFEFEF",
      };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
            <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
          </TouchableOpacity>

          <Breadcrumb
            items={[
              { label: "Menu", href: "/configuracoes/menuUser" },
              { label: "Configurações", href: "/configuracoes/config" },
              { label: "Privacidade" },
            ]}
            textColor={theme.textPrimary}
            containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Privacidade</Text>

        {/* Perfil */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Perfil</Text>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: theme.pillBackground }]}
            onPress={() =>
              setPerfilVisibilidade((prev) => (prev === "Público" ? "Privado" : "Público"))
            }
          >
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{perfilVisibilidade}</Text>
          </TouchableOpacity>
        </View>

        {/* Quem pode ver meus posts */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Quem pode ver meus posts?</Text>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: theme.pillBackground }]}
            onPress={() => setQuemVePostsAberto((prev) => !prev)}
          >
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{quemVePosts}</Text>
          </TouchableOpacity>
        </View>
        {quemVePostsAberto && (
          <View style={[styles.dropdown, { backgroundColor: theme.dropdownBackground }]}>
            {["Todos", "Seguidores"].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={styles.dropdownItem}
                onPress={() => {
                  setQuemVePosts(opcao as ListaOpcao);
                  setQuemVePostsAberto(false);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quem pode comentar */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Quem pode comentar</Text>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: theme.pillBackground }]}
            onPress={() => setQuemComentaAberto((prev) => !prev)}
          >
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{quemComenta}</Text>
          </TouchableOpacity>
        </View>
        {quemComentaAberto && (
          <View style={[styles.dropdown, { backgroundColor: theme.dropdownBackground }]}>
            {["Todos", "Seguindo"].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={styles.dropdownItem}
                onPress={() => {
                  setQuemComenta(opcao as ListaOpcao);
                  setQuemComentaAberto(false);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Usuários bloqueados */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setUsuariosBloqueadosAberto((prev) => !prev)}
        >
          <Text style={[styles.label, styles.boldLabel, { color: theme.textPrimary }]}>Usuários bloqueados</Text>
          <Text style={[styles.chevron, { color: theme.textPrimary }]}>{usuariosBloqueadosAberto ? "˄" : "˅"}</Text>
        </TouchableOpacity>
        {usuariosBloqueadosAberto && (
          <View style={[styles.dropdown, { backgroundColor: theme.dropdownBackground }]}>
            <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>Nenhum usuário bloqueado.</Text>
          </View>
        )}

        {/* Palavras bloqueadas */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setPalavrasBloqueadasAberto((prev) => !prev)}
        >
          <Text style={[styles.label, styles.boldLabel, { color: theme.textPrimary }]}>Palavras bloqueadas</Text>
          <Text style={[styles.chevron, { color: theme.textPrimary }]}>{palavrasBloqueadasAberto ? "˄" : "˅"}</Text>
        </TouchableOpacity>
        {palavrasBloqueadasAberto && (
          <View style={[styles.dropdown, { backgroundColor: theme.dropdownBackground }]}>
            <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>Nenhuma palavra bloqueada.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90, // espaço para a barra inferior
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backIcon: {
    marginRight: 0,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
  },
  boldLabel: {
    fontWeight: "600",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1F1F1F",
  },
  pillText: {
    fontSize: 13,
  },
  dropdown: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 16,
    marginLeft: 4,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 13,
    paddingHorizontal: 10,
  },
  chevron: {
    fontSize: 16,
  },
});

