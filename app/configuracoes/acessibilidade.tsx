import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Reusing the ToggleSwitch component for consistency across settings pages
type ToggleSwitchProps = {
    value: boolean;
    onToggle: () => void;
    trackColor: string;
    thumbColor: string;
    activeTrackColor?: string; // Standard blueprint blue
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
        outputRange: [3, 27], // Fixed thumb distance based on site standard
    });

    const currentTrackColor = value ? activeTrackColor : trackColor;

    return (
        <TouchableOpacity
            onPress={onToggle}
            style={[styles.switchTrack, { backgroundColor: currentTrackColor }]}
            activeOpacity={0.85}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
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

export default function Acessibilidade() {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    
    // Accessibility states
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
    const [altoContraste, setAltoContraste] = useState(false); // Explicitly off
    const [leitorDeTela, setLeitorDeTela] = useState(false);

    // Site theme and standard spacings
    const standardPadding = 16;
    const itemSpacing = 25;
    const labelSpacing = 10;
    const borderRadius = 10;

    const carregarTema = useCallback(async () => {
        try {
            const temaSalvo = await AsyncStorage.getItem('tema');
            const isDark = temaSalvo !== 'claro';
            setDarkMode(isDark);
        } catch (error) {
            console.log('Erro ao carregar tema:', error);
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
                background: '#121212', // Site standard background
                textPrimary: '#FFFFFF',
                badgeBackground: '#1F1F1F',
                badgeText: '#FFFFFF',
                switchTrack: '#333333',
                switchThumb: '#FFFFFF',
            }
        : {
                background: '#FFFFFF',
                textPrimary: '#000000',
                badgeBackground: '#EFEFEF',
                badgeText: '#000000',
                switchTrack: '#BDBDBD',
                switchThumb: '#000000',
            };

    // SettingRow encapsulates standard spacing for each setting item
    const SettingRow = ({ label, children }) => (
        <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{label}</Text>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* Header Padronizado (Copiado de InformacoesUser/EmailSenha) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Acessibilidade</Text>

                {/* 1. Tamanho das Fontes - standard Figma layout */}
                <SettingRow label="Tamanho das fontes">
                    <TouchableOpacity activeOpacity={0.7} style={[styles.badge, { backgroundColor: theme.badgeBackground }]}>
                        <Text style={[styles.badgeText, { color: theme.badgeText }]}>Aa+{fontSizeMultiplier.toFixed(1)}</Text>
                    </TouchableOpacity>
                </SettingRow>

                {/* 2. Alto Contraste - Standard Toggle Switch - EXPLICITLY OFF */}
                <SettingRow label="Alto Contraste">
                    <ToggleSwitch
                        value={altoContraste}
                        onToggle={() => setAltoContraste((prev) => !prev)}
                        trackColor={theme.switchTrack}
                        thumbColor={theme.switchThumb}
                    />
                </SettingRow>

                {/* 3. Leitor de Tela - Standard Toggle Switch */}
                <SettingRow label="Leitor de tela">
                    <ToggleSwitch
                        value={leitorDeTela}
                        onToggle={() => setLeitorDeTela((prev) => !prev)}
                        trackColor={theme.switchTrack}
                        thumbColor={theme.switchThumb}
                    />
                </SettingRow>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16, // Standard site padding
        paddingTop: 22,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        fontSize: 18,
        fontWeight: "bold",
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
        marginBottom: 30, // Large site title margin standard
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 25, // Large item spacing standard
    },
    settingLabel: {
        fontSize: 16, // Standard site field font size
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // Circular standard
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    switchTrack: {
        width: 52,
        height: 28,
        borderRadius: 16,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
});