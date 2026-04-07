import Breadcrumb from '@/components/Breadcrumb';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
		outputRange: [3, 27],
	});

	return (
		<TouchableOpacity
			onPress={onToggle}
			style={[styles.switchTrack, { backgroundColor: trackColor }]}
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
			const isDark = temaSalvo !== 'claro';
			setDarkMode(isDark);

			if (!temaSalvo) {
				await AsyncStorage.setItem('tema', 'escuro');
			}
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
				background: '#000000',
				textPrimary: '#f4f4f5',
				switchTrack: '#252a33',
				switchThumb: '#f4f4f5',
			}
		: {
				background: '#d9d9d9',
				textPrimary: '#111111',
				switchTrack: '#bdbdbd',
				switchThumb: '#111111',
			};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
						<Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
					</TouchableOpacity>

					<Breadcrumb
						items={[
							{ label: 'Menu', href: '/configuracoes/menuUser' },
							{ label: 'Configurações', href: '/configuracoes/config' },
							{ label: 'Notificações' },
						]}
						textColor={theme.textPrimary}
						containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
					/>
				</View>

				<Text style={[styles.title, { color: theme.textPrimary }]}>Notificações</Text>

				<View style={styles.list}>
					<View style={styles.row}>
						<Text style={[styles.label, { color: theme.textPrimary }]}>Curtidas</Text>
						<ToggleSwitch
							value={curtidas}
							onToggle={() => setCurtidas((prev) => !prev)}
							trackColor={theme.switchTrack}
							thumbColor={theme.switchThumb}
						/>
					</View>

					<View style={styles.row}>
						<Text style={[styles.label, { color: theme.textPrimary }]}>Novos Seguidores</Text>
						<ToggleSwitch
							value={novosSeguidores}
							onToggle={() => setNovosSeguidores((prev) => !prev)}
							trackColor={theme.switchTrack}
							thumbColor={theme.switchThumb}
						/>
					</View>

					<View style={styles.row}>
						<Text style={[styles.label, { color: theme.textPrimary }]}>Comentou</Text>
						<ToggleSwitch
							value={comentou}
							onToggle={() => setComentou((prev) => !prev)}
							trackColor={theme.switchTrack}
							thumbColor={theme.switchThumb}
						/>
					</View>

					<View style={styles.row}>
						<Text style={[styles.label, { color: theme.textPrimary }]}>Receber e-mail quando houver login na conta</Text>
						<ToggleSwitch
							value={emailLogin}
							onToggle={() => setEmailLogin((prev) => !prev)}
							trackColor={theme.switchTrack}
							thumbColor={theme.switchThumb}
						/>
					</View>
                    
					<View style={styles.row}>
						<Text style={[styles.label, { color: theme.textPrimary }]}>Ativar/desativar geral</Text>
						<ToggleSwitch
							value={geral}
							onToggle={() => setGeral((prev) => !prev)}
							trackColor={theme.switchTrack}
							thumbColor={theme.switchThumb}
						/>
					</View>


					<TouchableOpacity activeOpacity={0.8} style={styles.row}>
						<Text style={[styles.label, { color: theme.textPrimary }]}>Selenciar por um tempo</Text>
						<Text style={[styles.chevron, { color: theme.textPrimary }]}>⌄</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#000',
	},
	container: {
		flex: 1,
		backgroundColor: '#000',
		paddingHorizontal: 16,
		paddingTop: 10,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
		paddingHorizontal: 4,
	},
	backIcon: {
		marginRight: 0,
	},
	backText: {
		fontSize: 16,
		marginLeft: 6,
		fontWeight: '700',
	},
	title: {
		fontSize: 26,
		fontWeight: '700',
		marginBottom: 20,
	},
	list: {
		gap: 14,
	},
	row: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	label: {
		fontSize: 15,
		fontWeight: '600',
		flex: 1,
	},
	chevron: {
		fontSize: 18,
		marginLeft: 10,
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
