import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToggleSwitchProps = {
	value: boolean;
	onToggle: () => void;
};

function ToggleSwitch({ value, onToggle }: ToggleSwitchProps) {
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
			style={styles.switchTrack}
			activeOpacity={0.85}
			accessibilityRole="switch"
			accessibilityState={{ checked: value }}
		>
			<Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
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

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Text style={styles.backIcon}>←</Text>
						<Text style={styles.backText}>Voltar</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.title}>Notificações</Text>

				<View style={styles.list}>
					<View style={styles.row}>
						<Text style={styles.label}>Curtidas</Text>
						<ToggleSwitch value={curtidas} onToggle={() => setCurtidas((prev) => !prev)} />
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Novos Seguidores</Text>
						<ToggleSwitch
							value={novosSeguidores}
							onToggle={() => setNovosSeguidores((prev) => !prev)}
						/>
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Comentou</Text>
						<ToggleSwitch value={comentou} onToggle={() => setComentou((prev) => !prev)} />
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Receber e-mail quando houver login na conta</Text>
						<ToggleSwitch value={emailLogin} onToggle={() => setEmailLogin((prev) => !prev)} />
					</View>
                    
					<View style={styles.row}>
						<Text style={styles.label}>Ativar/desativar geral</Text>
						<ToggleSwitch value={geral} onToggle={() => setGeral((prev) => !prev)} />
					</View>


					<TouchableOpacity activeOpacity={0.8} style={styles.row}>
						<Text style={styles.label}>Selenciar por um tempo</Text>
						<Text style={styles.chevron}>⌄</Text>
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
		paddingVertical: 4,
		paddingRight: 8,
	},
	backIcon: {
		color: '#f4f4f5',
		fontSize: 20,
		marginRight: 4,
	},
	backText: {
		color: '#f4f4f5',
		fontSize: 18,
		fontWeight: '700',
	},
	title: {
		color: '#f4f4f5',
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
		color: '#f4f4f5',
		fontSize: 15,
		fontWeight: '600',
		flex: 1,
	},
	chevron: {
		color: '#f4f4f5',
		fontSize: 18,
		marginLeft: 10,
	},
	switchTrack: {
		width: 52,
		height: 28,
		borderRadius: 16,
		backgroundColor: '#252a33',
		justifyContent: 'center',
	},
	switchThumb: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: '#f4f4f5',
	},
});
