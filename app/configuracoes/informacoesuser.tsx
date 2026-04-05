import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function InformacoesUser() {
	const router = useRouter();
	const [nomeUsuario, setNomeUsuario] = useState('');
	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');
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
				inputBackground: '#393a3d',
				inputText: '#f4f4f5',
				placeholder: '#8d8d8d',
				icon: '#f4f4f5',
			}
		: {
				background: '#d9d9d9',
				textPrimary: '#111111',
				inputBackground: '#ffffff',
				inputText: '#111111',
				placeholder: '#6b6b6b',
				icon: '#111111',
			};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Text style={[styles.backIcon, { color: theme.textPrimary }]}>←</Text>
						<Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
					</TouchableOpacity>
				</View>

				<Text style={[styles.title, { color: theme.textPrimary }]}>Minhas informações</Text>

				<View style={styles.photoRow}>
					<Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Foto de perfil</Text>
					<TouchableOpacity activeOpacity={0.8} style={styles.cameraButton}>
						<Ionicons name="camera-outline" size={18} color={theme.icon} />
					</TouchableOpacity>
				</View>

				<View style={styles.group}>
					<Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Nome de usuário</Text>
					<TextInput
						value={nomeUsuario}
						onChangeText={setNomeUsuario}
						placeholder="Nome de usuário"
						placeholderTextColor={theme.placeholder}
						style={[
							styles.input,
							{ backgroundColor: theme.inputBackground, color: theme.inputText },
						]}
					/>
				</View>

				<View style={styles.group}>
					<Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>@username</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						placeholder="@username"
						placeholderTextColor={theme.placeholder}
						autoCapitalize="none"
						style={[
							styles.input,
							{ backgroundColor: theme.inputBackground, color: theme.inputText },
						]}
					/>
				</View>

				<View style={styles.group}>
					<Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Bio</Text>
					<TextInput
						value={bio}
						onChangeText={setBio}
						placeholder="Uma pequena descrição sobre você, o que você faz e com o que você trabalha, sua jornada acadêmica, etc..."
						placeholderTextColor={theme.placeholder}
						style={[
							styles.input,
							styles.bioInput,
							{ backgroundColor: theme.inputBackground, color: theme.inputText },
						]}
						multiline
						textAlignVertical="top"
					/>
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
		paddingHorizontal: 12,
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
		fontSize: 20,
		marginRight: 4,
	},
	backText: {
		fontSize: 18,
		fontWeight: '700',
	},
	title: {
		fontSize: 26,
		fontWeight: '700',
		marginBottom: 16,
	},
	photoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	sectionLabel: {
		fontSize: 14,
		fontWeight: '700',
	},
	cameraButton: {
		padding: 4,
	},
	group: {
		marginBottom: 12,
	},
	fieldLabel: {
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 6,
	},
	input: {
		fontSize: 14,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 6,
	},
	bioInput: {
		height: 110,
	},
});
