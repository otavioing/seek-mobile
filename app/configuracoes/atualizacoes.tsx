// import Breadcrumb from '@/components/Breadcrumb';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const updates = [
	{
		date: '10/02/26',
		description:
			'Melhora nas interfaces e telas para melhor compreendimento e retorno de feedback para os usuários',
	},
	{
		date: '10/02/26',
		description:
			'Melhora nas interfaces e telas para melhor compreendimento e retorno de feedback para os usuários',
	},
];

export default function Atualizacoes() {
	const router = useRouter();
	const isFocused = useIsFocused();
	const [darkMode, setDarkMode] = useState(false);

	const theme = darkMode
		? {
			background: '#090B0E',
			textPrimary: '#F5F5F7',
			textSecondary: '#9FA4AC',
			breadcrumb: '#B8BBC2',
		}
		: {
			background: '#D9D9D9',
			textPrimary: '#111111',
			textSecondary: '#4F4F4F',
			breadcrumb: '#5E5E5E',
		};

	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem('tema');
				setDarkMode(savedTheme === 'escuro');
			} catch (error) {
				console.log('Erro ao carregar tema:', error);
			}
		};

		if (isFocused) {
			loadTheme();
		}
	}, [isFocused]);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back-outline" size={24} color={theme.textPrimary} style={styles.backIcon} />
						<Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
					</TouchableOpacity>

					{/* <Breadcrumb
						items={[
							{ label: 'Menu', href: '/configuracoes/menuUser' },
							{ label: 'Configurações', href: '/configuracoes/config' },
							{ label: 'Atualizações' },
						]}
						textColor={theme.breadcrumb}
						containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
					/> */}
				</View>

				<Text style={[styles.title, { color: theme.textPrimary }]}>Atualizações</Text>

				<View style={styles.listContainer}>
					{updates.map((update, index) => (
						<View key={`${update.date}-${index}`} style={styles.updateItem}>
							<Text style={[styles.date, { color: theme.textPrimary }]}>{update.date}</Text>
							<Text style={[styles.description, { color: theme.textSecondary }]}>{update.description}</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 32,
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
		// fontWeight: '700',
	},
	title: {
		fontSize: 36,
		fontWeight: '700',
		letterSpacing: -0.6,
		marginBottom: 14,
	},
	listContainer: {
		gap: 14,
	},
	updateItem: {
		gap: 2,
	},
	date: {
		fontSize: 24,
		fontWeight: '700',
		letterSpacing: -0.4,
	},
	description: {
		fontSize: 18,
		lineHeight: 23,
		maxWidth: '98%',
	},
});
