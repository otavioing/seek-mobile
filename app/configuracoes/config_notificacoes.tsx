import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToggleSwitchProps = {
    value: boolean;
    onToggle: () => void;
    trackColor: string;
    thumbColor: string;
};

function ToggleSwitch({ value, onToggle, trackColor, thumbColor }: ToggleSwitchProps) {
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
        outputRange: [3, 27], // Ajuste para o tamanho do track de 52px
    });

    return (
        <TouchableOpacity
            onPress={onToggle}
            style={[styles.switchTrack, { backgroundColor: trackColor }]}
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

export default function Notificacoes() {
    const router = useRouter();
    const [curtidas, setCurtidas] = useState(true);
    const [novosSeguidores, setNovosSeguidores] = useState(true);
    const [comentou, setComentou] = useState(false);
    const [geral, setGeral] = useState(false);
    const [emailLogin, setEmailLogin] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const carregarTema = useCallback(async () => {
        try {
            const temaSalvo = await AsyncStorage.getItem('tema');
            setDarkMode(temaSalvo !== 'claro');
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
                background: '#121212', // Padronizado com sua tela Config
                textPrimary: '#FFFFFF',
                textSecondary: '#B0B0B0',
                switchTrack: '#333333',
                switchThumb: '#FFFFFF',
            }
        : {
                background: '#F2F2F2',
                textPrimary: '#111111',
                textSecondary: '#5C5C5C',
                switchTrack: '#BDBDBD',
                switchThumb: '#111111',
            };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
                    <Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} />
                    <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Notificações</Text>

                <View style={styles.list}>
                    {/* Item Curtidas */}
                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Curtidas</Text>
                        <ToggleSwitch
                            value={curtidas}
                            onToggle={() => setCurtidas((prev) => !prev)}
                            trackColor={curtidas ? '#3B82F6' : theme.switchTrack}
                            thumbColor={theme.switchThumb}
                        />
                    </View>

                    {/* Item Novos Seguidores */}
                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Novos Seguidores</Text>
                        <ToggleSwitch
                            value={novosSeguidores}
                            onToggle={() => setNovosSeguidores((prev) => !prev)}
                            trackColor={novosSeguidores ? '#3B82F6' : theme.switchTrack}
                            thumbColor={theme.switchThumb}
                        />
                    </View>

                    {/* Item Comentou */}
                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Comentou</Text>
                        <ToggleSwitch
                            value={comentou}
                            onToggle={() => setComentou((prev) => !prev)}
                            trackColor={comentou ? '#3B82F6' : theme.switchTrack}
                            thumbColor={theme.switchThumb}
                        />
                    </View>

                    {/* Item Login */}
                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Receber e-mail no login</Text>
                        <ToggleSwitch
                            value={emailLogin}
                            onToggle={() => setEmailLogin((prev) => !prev)}
                            trackColor={emailLogin ? '#3B82F6' : theme.switchTrack}
                            thumbColor={theme.switchThumb}
                        />
                    </View>
                    
                    {/* Item Geral */}
                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Ativar/desativar geral</Text>
                        <ToggleSwitch
                            value={geral}
                            onToggle={() => setGeral((prev) => !prev)}
                            trackColor={geral ? '#3B82F6' : theme.switchTrack}
                            thumbColor={theme.switchThumb}
                        />
                    </View>

                    {/* Item Silenciar */}
                    <TouchableOpacity activeOpacity={0.7} style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Silenciar por um tempo</Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textPrimary} />
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
    topBar: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    backRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },
    backText: {
        fontSize: 16,
        marginLeft: 6,
        // fontWeight: "500",
    },
    content: {
        paddingBottom: 90,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    list: {
        width: '100%',
    },
    fbtContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 16,
        width: "100%",
    },
    textoFiltro: {
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
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