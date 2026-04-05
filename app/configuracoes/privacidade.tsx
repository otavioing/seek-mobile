import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PerfilVisibilidade = "Público" | "Privado";
type ListaOpcao = "Todos" | "Seguidores" | "Seguindo";

export default function Privacidade() {
  const router = useRouter();
  const [perfilVisibilidade, setPerfilVisibilidade] = useState<PerfilVisibilidade>("Público");

  const [quemVePosts, setQuemVePosts] = useState<ListaOpcao>("Todos");
  const [quemVePostsAberto, setQuemVePostsAberto] = useState(false);

  const [quemComenta, setQuemComenta] = useState<ListaOpcao>("Todos");
  const [quemComentaAberto, setQuemComentaAberto] = useState(false);

  const [usuariosBloqueadosAberto, setUsuariosBloqueadosAberto] = useState(false);
  const [palavrasBloqueadasAberto, setPalavrasBloqueadasAberto] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Privacidade</Text>

        {/* Perfil */}
        <View style={styles.row}>
          <Text style={styles.label}>Perfil</Text>
          <TouchableOpacity
            style={styles.pill}
            onPress={() =>
              setPerfilVisibilidade((prev) => (prev === "Público" ? "Privado" : "Público"))
            }
          >
            <Text style={styles.pillText}>{perfilVisibilidade}</Text>
          </TouchableOpacity>
        </View>

        {/* Quem pode ver meus posts */}
        <View style={styles.row}>
          <Text style={styles.label}>Quem pode ver meus posts?</Text>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => setQuemVePostsAberto((prev) => !prev)}
          >
            <Text style={styles.pillText}>{quemVePosts}</Text>
          </TouchableOpacity>
        </View>
        {quemVePostsAberto && (
          <View style={styles.dropdown}>
            {["Todos", "Seguidores"].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={styles.dropdownItem}
                onPress={() => {
                  setQuemVePosts(opcao as ListaOpcao);
                  setQuemVePostsAberto(false);
                }}
              >
                <Text style={styles.dropdownText}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quem pode comentar */}
        <View style={styles.row}>
          <Text style={styles.label}>Quem pode comentar</Text>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => setQuemComentaAberto((prev) => !prev)}
          >
            <Text style={styles.pillText}>{quemComenta}</Text>
          </TouchableOpacity>
        </View>
        {quemComentaAberto && (
          <View style={styles.dropdown}>
            {["Todos", "Seguindo"].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={styles.dropdownItem}
                onPress={() => {
                  setQuemComenta(opcao as ListaOpcao);
                  setQuemComentaAberto(false);
                }}
              >
                <Text style={styles.dropdownText}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Usuários bloqueados */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setUsuariosBloqueadosAberto((prev) => !prev)}
        >
          <Text style={[styles.label, styles.boldLabel]}>Usuários bloqueados</Text>
          <Text style={styles.chevron}>{usuariosBloqueadosAberto ? "˄" : "˅"}</Text>
        </TouchableOpacity>
        {usuariosBloqueadosAberto && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Nenhum usuário bloqueado.</Text>
          </View>
        )}

        {/* Palavras bloqueadas */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setPalavrasBloqueadasAberto((prev) => !prev)}
        >
          <Text style={[styles.label, styles.boldLabel]}>Palavras bloqueadas</Text>
          <Text style={styles.chevron}>{palavrasBloqueadasAberto ? "˄" : "˅"}</Text>
        </TouchableOpacity>
        {palavrasBloqueadasAberto && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Nenhuma palavra bloqueada.</Text>
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
    paddingVertical: 4,
    paddingRight: 8,
  },
  backIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    marginRight: 4,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
    color: "#FFFFFF",
    fontSize: 13,
    paddingHorizontal: 10,
  },
  chevron: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

