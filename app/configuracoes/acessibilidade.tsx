import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';

// 1. Componente de Switch Customizado
type ToggleSwitchProps = {
    value: boolean;
    onToggle: () => void;
    trackColor: string;
    thumbColor: string;
    activeTrackColor?: string;
};

function ToggleSwitch({ value, onToggle, trackColor, thumbColor, activeTrackColor = '#2563eb' }: ToggleSwitchProps) {
    const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: value ? 1 : 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [progress, value]);

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [3, 27],
    });

    const currentTrackColor = value ? activeTrackColor : trackColor;

    return (
        <TouchableOpacity
            onPress={onToggle}
            style={[styles.switchTrack, { backgroundColor: currentTrackColor }]}
            activeOpacity={0.85}
        >
            <Animated.View
                style={[
                    styles.switchThumb,
                    { backgroundColor: thumbColor, transform: [{ translateX }] },
                ]}
            />
        </TouchableOpacity>
    );
}

// 2. Tela Principal
export default function Acessibilidade() {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
    const [altoContraste, setAltoContraste] = useState(false);
    const [leitorDeTela, setLeitorDeTela] = useState(false);
    const [modalVisivel, setModalVisivel] = useState(false);

    const carregarTema = useCallback(async () => {
        try {
            const temaSalvo = await AsyncStorage.getItem('tema');
            setDarkMode(temaSalvo !== 'claro');
        } catch (error) {
            console.log('Erro ao carregar tema:', error);
        }
    }, []);

    useEffect(() => { carregarTema(); }, [carregarTema]);
    useFocusEffect(useCallback(() => { carregarTema(); }, [carregarTema]));

    // Definição do tema com a propriedade 'card' para o Modal
    const theme = darkMode
        ? { 
            background: '#121212', 
            card: '#1F1F1F', 
            textPrimary: '#FFFFFF', 
            badgeBackground: '#1F1F1F', 
            badgeText: '#FFFFFF', 
            switchTrack: '#333333', 
            switchThumb: '#FFFFFF' 
          }
        : { 
            background: '#FFFFFF', 
            card: '#F5F5F5', 
            textPrimary: '#000000', 
            badgeBackground: '#EFEFEF', 
            badgeText: '#000000', 
            switchTrack: '#BDBDBD', 
            switchThumb: '#000000' 
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
                <Text style={[styles.title, { color: theme.textPrimary }]}>Acessibilidade</Text>

                {/* Linha clicável que abre o Modal */}
                <TouchableOpacity 
                    style={styles.settingRow} 
                    onPress={() => setModalVisivel(true)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Tamanho das fontes</Text>
                    <View style={[styles.badge, { backgroundColor: theme.badgeBackground }]}>
                        <Text style={[styles.badgeText, { color: theme.badgeText }]}>Aa+{fontSizeMultiplier.toFixed(1)}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.settingRow}>
                    <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Alto Contraste</Text>
                    <ToggleSwitch 
                        value={altoContraste} 
                        onToggle={() => setAltoContraste(!altoContraste)} 
                        trackColor={theme.switchTrack} 
                        thumbColor={theme.switchThumb} 
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Leitor de tela</Text>
                    <ToggleSwitch 
                        value={leitorDeTela} 
                        onToggle={() => setLeitorDeTela(!leitorDeTela)} 
                        trackColor={theme.switchTrack} 
                        thumbColor={theme.switchThumb} 
                    />
                </View>
            </ScrollView>

            {/* Modal do Slider */}
            <Modal 
                animationType="fade" 
                transparent={true} 
                visible={modalVisivel} 
                onRequestClose={() => setModalVisivel(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisivel(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.sliderLabels}>
                            <Text style={[styles.labelPequeno, { color: theme.textPrimary }]}>Aa</Text>
                            <Text style={[styles.valorCentral, { color: theme.textPrimary }]}>+{fontSizeMultiplier.toFixed(1)}</Text>
                            <Text style={[styles.labelGrande, { color: theme.textPrimary }]}>Aa</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={1.0}
                            maximumValue={2.0}
                            step={0.1}
                            value={fontSizeMultiplier}
                            onValueChange={(v) => setFontSizeMultiplier(v)}
                            minimumTrackTintColor={theme.textPrimary}
                            maximumTrackTintColor={darkMode ? "#444" : "#CCC"}
                            thumbTintColor={theme.textPrimary}
                        />
                    </Pressable>
                </Pressable>
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
    content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
    title: { fontSize: 32, fontWeight: "bold", marginBottom: 30 },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
    settingLabel: { fontSize: 16, fontWeight: '500' },
    badge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    badgeText: { fontSize: 14, fontWeight: '500' },
    switchTrack: { width: 52, height: 28, borderRadius: 16, justifyContent: 'center' },
    switchThumb: { width: 22, height: 22, borderRadius: 11 },
    // Estilos do Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', padding: 25, borderRadius: 15, elevation: 5 },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
    labelPequeno: { fontSize: 18 },
    labelGrande: { fontSize: 32 },
    valorCentral: { fontSize: 20, fontWeight: 'bold' },
    slider: { width: '100%', height: 40 },
});