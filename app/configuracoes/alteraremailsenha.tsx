import Breadcrumb from '@/components/Breadcrumb';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AlterarEmailSenha() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [senhaAtual, setSenhaAtual] = useState('');
	const [novaSenha, setNovaSenha] = useState('');
	const [showSenhaAtual, setShowSenhaAtual] = useState(false);
	const [showNovaSenha, setShowNovaSenha] = useState(false);
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
				icon: '#999999',
				buttonBackground: '#2563eb',
				buttonText: '#f4f4f5',
			}
		: {
				background: '#d9d9d9',
				textPrimary: '#111111',
				inputBackground: '#ffffff',
				inputText: '#111111',
				placeholder: '#6b6b6b',
				icon: '#4f4f4f',
				buttonBackground: '#111111',
				buttonText: '#f4f4f5',
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
							{ label: 'Email e Senha' },
						]}
						textColor={theme.textPrimary}
						containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
					/>
				</View>

				<Text style={[styles.title, { color: theme.textPrimary }]}>Email e Senha</Text>

				<View style={styles.group}>
					<Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>E-mail</Text>
					<TextInput
						value={email}
						onChangeText={setEmail}
						placeholder="nome@email.com"
						placeholderTextColor={theme.placeholder}
						keyboardType="email-address"
						autoCapitalize="none"
						style={[
							styles.input,
							{ backgroundColor: theme.inputBackground, color: theme.inputText },
						]}
					/>
				</View>

				<View style={styles.group}>
					<Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Senha atuala</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							value={senhaAtual}
							onChangeText={setSenhaAtual}
							placeholder="****"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={!showSenhaAtual}
							style={[
								styles.passwordInput,
								{ backgroundColor: theme.inputBackground, color: theme.inputText },
							]}
						/>
						<TouchableOpacity
							style={styles.eyeButton}
							onPress={() => setShowSenhaAtual(!showSenhaAtual)}
						>
							<Ionicons
								name={showSenhaAtual ? 'eye' : 'eye-off'}
								size={16}
								color={theme.icon}
							/>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.group}>
					<Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Alterar senha</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							value={novaSenha}
							onChangeText={setNovaSenha}
							placeholder="****"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={!showNovaSenha}
							style={[
								styles.passwordInput,
								{ backgroundColor: theme.inputBackground, color: theme.inputText },
							]}
						/>
						<TouchableOpacity
							style={styles.eyeButton}
							onPress={() => setShowNovaSenha(!showNovaSenha)}
						>
							<Ionicons
								name={showNovaSenha ? 'eye' : 'eye-off'}
								size={16}
								color={theme.icon}
							/>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.footer}>
					<TouchableOpacity
						activeOpacity={0.85}
						style={[styles.confirmButton, { backgroundColor: theme.buttonBackground }]}
					>
						<Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Confirmar</Text>
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
		fontSize: 32,
		fontWeight: '700',
		marginBottom: 14,
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
	passwordContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
	},
	passwordInput: {
		fontSize: 14,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 6,
		flex: 1,
		paddingRight: 40,
	},
	eyeButton: {
		position: 'absolute',
		right: 10,
		padding: 6,
	},
	footer: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		paddingBottom: 12,
	},
	confirmButton: {
		backgroundColor: '#2563eb',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
	},
	confirmButtonText: {
		fontSize: 14,
		fontWeight: '700',
	},
});
