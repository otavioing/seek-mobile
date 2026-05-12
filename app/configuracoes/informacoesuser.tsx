import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function InformacoesUser() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [darkMode, setDarkMode] = useState(true);

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
        inputBackground: "#1F1F1F",
        inputText: "#FFFFFF",
        placeholder: "#8d8d8d",
        icon: "#FFFFFF",
        buttonBackground: "#2563eb",
        buttonText: "#f4f4f5",
      }
    : {
        background: "#FFFFFF",
        textPrimary: "#000000",
        inputBackground: "#EFEFEF",
        inputText: "#000000",
        placeholder: "#6b6b6b",
        icon: "#000000",
        buttonBackground: "#111111",
        buttonText: "#f4f4f5",
      };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      {/* Header Padronizado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Minhas informações
        </Text>


		<View style={styles.photoRow}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
            Foto do banner
          </Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.photoRow}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
            Foto de perfil
          </Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>


        <View style={styles.group}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
            Nome de usuário
          </Text>
          <TextInput
            value={nomeUsuario}
            onChangeText={setNomeUsuario}
            placeholder="Nome de usuário"
            placeholderTextColor={theme.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                color: theme.inputText,
              },
            ]}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
            @username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="@username"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                color: theme.inputText,
              },
            ]}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
            Bio
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Uma pequena descrição sobre você..."
            placeholderTextColor={theme.placeholder}
            style={[
              styles.input,
              styles.bioInput,
              {
                backgroundColor: theme.inputBackground,
                color: theme.inputText,
              },
            ]}
            multiline
            textAlignVertical="top"
          />
        </View>
        <View style={styles.footer}>
							<TouchableOpacity
								activeOpacity={0.85}
								style={[styles.confirmButton, { backgroundColor: theme.buttonBackground }]}
							>
								<Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Confirmar</Text>
							</TouchableOpacity>
						</View>
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
    paddingTop: 22,
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  cameraButton: {
    padding: 4,
  },
  group: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    fontSize: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bioInput: {
    height: 120,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 12,
  },
  confirmButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
