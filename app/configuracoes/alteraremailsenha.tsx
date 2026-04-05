import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AlterarEmailSenha() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [senhaAtual, setSenhaAtual] = useState('');
	const [novaSenha, setNovaSenha] = useState('');
	const [showSenhaAtual, setShowSenhaAtual] = useState(false);
	const [showNovaSenha, setShowNovaSenha] = useState(false);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Text style={styles.backIcon}>←</Text>
						<Text style={styles.backText}>Voltar</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.title}>Email e Senha</Text>

				<View style={styles.group}>
					<Text style={styles.fieldLabel}>E-mail</Text>
					<TextInput
						value={email}
						onChangeText={setEmail}
						placeholder="nome@email.com"
						placeholderTextColor="#8d8d8d"
						keyboardType="email-address"
						autoCapitalize="none"
						style={styles.input}
					/>
				</View>

				<View style={styles.group}>
					<Text style={styles.fieldLabel}>Senha atuala</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							value={senhaAtual}
							onChangeText={setSenhaAtual}
							placeholder="****"
							placeholderTextColor="#8d8d8d"
							secureTextEntry={!showSenhaAtual}
							style={styles.passwordInput}
						/>
						<TouchableOpacity
							style={styles.eyeButton}
							onPress={() => setShowSenhaAtual(!showSenhaAtual)}
						>
							<Ionicons
								name={showSenhaAtual ? 'eye' : 'eye-off'}
								size={16}
								color="#999"
							/>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.group}>
					<Text style={styles.fieldLabel}>Alterar senha</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							value={novaSenha}
							onChangeText={setNovaSenha}
							placeholder="****"
							placeholderTextColor="#8d8d8d"
							secureTextEntry={!showNovaSenha}
							style={styles.passwordInput}
						/>
						<TouchableOpacity
							style={styles.eyeButton}
							onPress={() => setShowNovaSenha(!showNovaSenha)}
						>
							<Ionicons
								name={showNovaSenha ? 'eye' : 'eye-off'}
								size={16}
								color="#999"
							/>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.footer}>
					<TouchableOpacity activeOpacity={0.85} style={styles.confirmButton}>
						<Text style={styles.confirmButtonText}>Confirmar</Text>
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
		fontSize: 32,
		fontWeight: '700',
		marginBottom: 14,
	},
	group: {
		marginBottom: 12,
	},
	fieldLabel: {
		color: '#f4f4f5',
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 6,
	},
	input: {
		backgroundColor: '#393a3d',
		color: '#f4f4f5',
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
		backgroundColor: '#393a3d',
		color: '#f4f4f5',
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
		color: '#f4f4f5',
		fontSize: 14,
		fontWeight: '700',
	},
});
