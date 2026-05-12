import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';

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
    }, [value]);

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [3, 27],
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
    const [darkMode, setDarkMode] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Estados dos Toggles Originais
    const [curtidas, setCurtidas] = useState(true);
    const [novosSeguidores, setNovosSeguidores] = useState(true);
    const [comentou, setComentou] = useState(false);
    const [emailLogin, setEmailLogin] = useState(false);
    const [geral, setGeral] = useState(false);

    const carregarTema = useCallback(async () => {
        try {
            const temaSalvo = await AsyncStorage.getItem('tema');
            setDarkMode(temaSalvo !== 'claro');
        } catch (error) { console.log('Erro ao carregar tema:', error); }
    }, []);

    useEffect(() => { carregarTema(); }, [carregarTema]);
    useFocusEffect(useCallback(() => { carregarTema(); }, [carregarTema]));

    const theme = darkMode
        ? { background: '#121212', textPrimary: '#FFFFFF', textSecondary: '#B0B0B0', switchTrack: '#333333', switchThumb: '#FFFFFF', card: '#1E1E1E', divider: '#333' }
        : { background: '#F2F2F2', textPrimary: '#111111', textSecondary: '#5C5C5C', switchTrack: '#BDBDBD', switchThumb: '#111111', card: '#FFFFFF', divider: '#E0E0E0' };

    const opcoesSilenciar = [
        { label: 'Ligar notificações', icon: 'notifications-outline', color: '#3B82F6' },
        { label: 'Silenciar por 10 minutos', icon: 'timer-outline' },
        { label: 'Silenciar por 1 hora', icon: 'time-outline' },
        { label: 'Silenciar por 12 horas', icon: 'sunny-outline' },
        { label: 'Silenciar por 1 dia', icon: 'calendar-outline' },
        { label: 'Silenciar por 1 semana', icon: 'briefcase-outline' },
        { label: 'Até eu ligar novamente', icon: 'infinite-outline', color: '#EF4444' },
    ];

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
                    {/* Lista de Toggles Reais */}
                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Curtidas</Text>
                        <ToggleSwitch value={curtidas} onToggle={() => setCurtidas(!curtidas)} trackColor={curtidas ? '#3B82F6' : theme.switchTrack} thumbColor={theme.switchThumb} />
                    </View>

                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Novos Seguidores</Text>
                        <ToggleSwitch value={novosSeguidores} onToggle={() => setNovosSeguidores(!novosSeguidores)} trackColor={novosSeguidores ? '#3B82F6' : theme.switchTrack} thumbColor={theme.switchThumb} />
                    </View>

                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Comentou</Text>
                        <ToggleSwitch value={comentou} onToggle={() => setComentou(!comentou)} trackColor={comentou ? '#3B82F6' : theme.switchTrack} thumbColor={theme.switchThumb} />
                    </View>

                    <View style={styles.fbtContainer}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>Receber e-mail no login</Text>
                        <ToggleSwitch value={emailLogin} onToggle={() => setEmailLogin(!emailLogin)} trackColor={emailLogin ? '#3B82F6' : theme.switchTrack} thumbColor={theme.switchThumb} />
                    </View>


                    {/* Botão do Modal */}
                    <TouchableOpacity activeOpacity={0.7} style={styles.fbtContainer} onPress={() => setModalVisible(true)}>
                        <Text style={[styles.textoFiltro, { color: theme.textPrimary, fontWeight: '700' }]}>Silenciar notificações</Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textPrimary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal Centralizado com Blur */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalWrapper}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.overlay} />
                    </Pressable>

                    <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Silenciar por...</Text>
                        
                        <View style={styles.optionsList}>
                            {opcoesSilenciar.map((opt, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[styles.optionItem, { borderBottomColor: theme.divider, borderBottomWidth: index === opcoesSilenciar.length - 1 ? 0 : 1 }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <View style={styles.optionContent}>
                                        <Ionicons name={opt.icon as any} size={22} color={opt.color || theme.textPrimary} />
                                        <Text style={[styles.optionLabel, { color: opt.color || theme.textPrimary }]}>{opt.label}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    topBar: { paddingTop: 20, paddingHorizontal: 16 },
    backRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
    backText: { fontSize: 16, marginLeft: 6 },
    content: { paddingBottom: 90 },
    title: { fontSize: 32, fontWeight: "700", paddingHorizontal: 16, marginTop: 10, marginBottom: 20 },
    list: { width: '100%' },
    fbtContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, paddingHorizontal: 16 },
    textoFiltro: { fontSize: 16, fontWeight: "500", flex: 1 },
    switchTrack: { width: 52, height: 28, borderRadius: 16, justifyContent: 'center' },
    switchThumb: { width: 22, height: 22, borderRadius: 11 },
    
    // Modal Styles
    modalWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalCard: { width: '100%', borderRadius: 28, padding: 20, elevation: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    optionsList: { width: '100%' },
    optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
    optionContent: { flexDirection: 'row', alignItems: 'center' },
    optionLabel: { fontSize: 16, marginLeft: 12, fontWeight: '500' },
    closeBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
    closeBtnText: { fontSize: 14, fontWeight: '600' }
});