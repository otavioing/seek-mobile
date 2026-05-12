import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Dimensions,
  Pressable
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from "expo-blur";
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function InformacoesUser() {
  const router = useRouter();

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Estados de Imagem
  const [perfilImage, setPerfilImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<'perfil' | 'banner' | null>(null);

  // Modais
  const [showOptions, setShowOptions] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Estados de Transformação
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;

  const carregarTema = useCallback(async () => {
    try {
      const temaSalvo = await AsyncStorage.getItem("tema");
      setDarkMode(temaSalvo !== "claro");
    } catch (error) { console.log(error); }
  }, []);

  useEffect(() => { carregarTema(); }, [carregarTema]);
  useFocusEffect(useCallback(() => { carregarTema(); }, [carregarTema]));

  // FUNÇÃO PARA RESETAR TUDO ANTES DE ABRIR O EDITOR
  const resetValues = () => {
    setRotation(0);
    setZoom(1);
    rotateAnim.setValue(0);
    zoomAnim.setValue(1);
  };

  const openOptions = (target: 'perfil' | 'banner') => {
    setEditingTarget(target);
    setShowOptions(true);
  };

  const handleOpenEditor = () => {
    resetValues(); // Garante a bolinha no meio/zoom padrão
    setShowOptions(false);
    setShowEditor(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      if (editingTarget === 'perfil') setPerfilImage(result.assets[0].uri);
      else setBannerImage(result.assets[0].uri);
      handleOpenEditor();
    }
  };

  const handleSliderChange = (value: number) => {
    if (editingTarget === 'banner') {
      setZoom(value);
      zoomAnim.setValue(value);
    } else {
      setRotation(value);
      rotateAnim.setValue(value);
    }
  };

  const handleReset = () => {
    resetValues();
    Animated.parallel([
      Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.spring(zoomAnim, { toValue: 1, useNativeDriver: true, friction: 8 })
    ]).start();
  };

  const theme = darkMode
    ? { background: "#121212", textPrimary: "#FFFFFF", inputBackground: "#1F1F1F", inputText: "#FFFFFF", placeholder: "#8d8d8d", icon: "#FFFFFF", buttonBackground: "#2563eb", buttonText: "#f4f4f5", card: "#1E1E1E" }
    : { background: "#FFFFFF", textPrimary: "#000000", inputBackground: "#EFEFEF", inputText: "#000000", placeholder: "#6b6b6b", icon: "#000000", buttonBackground: "#111111", buttonText: "#f4f4f5", card: "#F5F5F5" };

  const currentEditingImage = editingTarget === 'perfil' ? perfilImage : bannerImage;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Minhas informações</Text>

        <View style={styles.photoRow}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Foto do banner</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.cameraButton} onPress={() => openOptions('banner')}>
            <Ionicons name="camera-outline" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.photoRow}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Foto de perfil</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.cameraButton} onPress={() => openOptions('perfil')}>
            <Ionicons name="camera-outline" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Demais Inputs mantidos conforme original */}
        <View style={styles.group}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Nome de usuário</Text>
          <TextInput value={nomeUsuario} onChangeText={setNomeUsuario} placeholder="Nome de usuário" placeholderTextColor={theme.placeholder} style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]} />
        </View>

        <View style={styles.group}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>@username</Text>
          <TextInput value={username} onChangeText={setUsername} placeholder="@username" placeholderTextColor={theme.placeholder} autoCapitalize="none" style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]} />
        </View>

        <View style={styles.group}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Bio</Text>
          <TextInput value={bio} onChangeText={setBio} placeholder="Uma pequena descrição sobre você..." placeholderTextColor={theme.placeholder} multiline textAlignVertical="top" style={[styles.input, styles.bioInput, { backgroundColor: theme.inputBackground, color: theme.inputText }]} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.buttonBackground }]}>
            <Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE OPÇÕES */}
      <Modal visible={showOptions} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.optionsCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.optionBtn} onPress={handleOpenEditor}>
              <Ionicons name="create-outline" size={20} color={theme.textPrimary} />
              <Text style={[styles.optionText, { color: theme.textPrimary }]}>Editar foto atual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBtn, { borderTopWidth: 1, borderTopColor: '#333' }]} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color={theme.textPrimary} />
              <Text style={[styles.optionText, { color: theme.textPrimary }]}>Mudar foto</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* MODAL DE EDIÇÃO */}
      <Modal visible={showEditor} transparent animationType="slide">
        <View style={[styles.editorContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.editorTitle, { color: theme.textPrimary }]}>
            {editingTarget === 'banner' ? 'Zoom do Banner' : 'Girar Perfil'}
          </Text>

          <View style={[styles.imageWrapper, editingTarget === 'banner' && styles.bannerWrapper]}>
            <Animated.Image
              source={{ uri: currentEditingImage || 'https://via.placeholder.com/300' }}
              style={[styles.previewImage, {
                transform: [
                  { rotate: rotateAnim.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] }) },
                  { scale: zoomAnim }
                ]
              }]}
            />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={handleReset} style={styles.rotateBtn}>
              <Ionicons name="refresh" size={32} color={theme.textPrimary} />
            </TouchableOpacity>

            <Slider
              style={{ width: '100%', height: 40 }}
              // Banner usa Zoom (1 a 3), Perfil usa Rotação (-180 a 180)
              minimumValue={editingTarget === 'banner' ? 1 : -180}
              maximumValue={editingTarget === 'banner' ? 3 : 180}
              value={editingTarget === 'banner' ? zoom : rotation}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={theme.buttonBackground}
              maximumTrackTintColor="#555"
              thumbTintColor="#FFF"
            />

            <TouchableOpacity
              style={[styles.confirmButton, { marginTop: 40, width: '100%', backgroundColor: theme.buttonBackground }]}
              onPress={() => setShowEditor(false)}
            >
              <Text style={[styles.confirmButtonText, { color: theme.buttonText, fontSize: 16 }]}>Concluir</Text>
            </TouchableOpacity>
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
  backText: { fontSize: 18, marginLeft: 8 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 30 },
  photoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontWeight: "700" },
  cameraButton: { padding: 4 },
  group: { marginBottom: 25 },
  fieldLabel: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  input: { fontSize: 15, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10 },
  bioInput: { height: 120 },
  footer: { alignItems: "flex-end", marginTop: 20 },
  confirmButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  confirmButtonText: { fontSize: 14, fontWeight: "700" },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  optionsCard: { width: '80%', borderRadius: 20, padding: 10 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  optionText: { marginLeft: 15, fontSize: 16, fontWeight: '600' },
  editorContainer: { flex: 1, alignItems: 'center', paddingTop: 60 },
  editorTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  imageWrapper: { width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, overflow: 'hidden', backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' },
  bannerWrapper: { width: width * 0.9, height: width * 0.4, borderRadius: 15 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  controls: { width: '80%', alignItems: 'center', marginTop: 40 },
  rotateBtn: { marginBottom: 20 },
});