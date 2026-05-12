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
        background: "#121212",
        textPrimary: "#FFFFFF",
        pillBackground: "#1F1F1F",
        dropdownBackground: "#111111",
      }
    : {
        background: "#FFFFFF",
        textPrimary: "#000000",
        pillBackground: "#EFEFEF",
        dropdownBackground: "#F5F5F5",
      };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Botão Voltar alinhado ao padrão das outras telas */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Privacidade</Text>

        {/* Perfil */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Perfil</Text>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: theme.pillBackground }]}
            onPress={() => setPerfilVisibilidade((prev) => (prev === "Público" ? "Privado" : "Público"))}
          >
            <Text style={[styles.pillText, { color: theme.textPrimary }]}>{perfilVisibilidade}</Text>
          </TouchableOpacity>
        </View>

        {/* Quem pode ver meus posts? */}
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
          <Ionicons 
            name={usuariosBloqueadosAberto ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.textPrimary} 
          />
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
          <Ionicons 
            name={palavrasBloqueadasAberto ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.textPrimary} 
          />
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
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 18,
    // fontWeight: "bold",
    marginLeft: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  boldLabel: {
    fontWeight: "600",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdown: {
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 20,
    marginTop: -10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 14,
  },
});