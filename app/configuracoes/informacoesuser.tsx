import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function InformacoesUser() {
	const router = useRouter();
	const [nomeUsuario, setNomeUsuario] = useState('');
	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Text style={styles.backIcon}>←</Text>
						<Text style={styles.backText}>Voltar</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.title}>Minhas informações</Text>

				<View style={styles.photoRow}>
					<Text style={styles.sectionLabel}>Foto de perfil</Text>
					<TouchableOpacity activeOpacity={0.8} style={styles.cameraButton}>
						<Ionicons name="camera-outline" size={18} color="#f4f4f5" />
					</TouchableOpacity>
				</View>

				<View style={styles.group}>
					<Text style={styles.fieldLabel}>Nome de usuário</Text>
					<TextInput
						value={nomeUsuario}
						onChangeText={setNomeUsuario}
						placeholder="Nome de usuário"
						placeholderTextColor="#8d8d8d"
						style={styles.input}
					/>
				</View>

				<View style={styles.group}>
					<Text style={styles.fieldLabel}>@username</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						placeholder="@username"
						placeholderTextColor="#8d8d8d"
						autoCapitalize="none"
						style={styles.input}
					/>
				</View>

				<View style={styles.group}>
					<Text style={styles.fieldLabel}>Bio</Text>
					<TextInput
						value={bio}
						onChangeText={setBio}
						placeholder="Uma pequena descrição sobre você, o que você faz e com o que você trabalha, sua jornada acadêmica, etc..."
						placeholderTextColor="#8d8d8d"
						style={[styles.input, styles.bioInput]}
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
		marginBottom: 16,
	},
	photoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	sectionLabel: {
		color: '#f4f4f5',
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
	bioInput: {
		height: 110,
	},
});
