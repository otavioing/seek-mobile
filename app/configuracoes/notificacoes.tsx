import Breadcrumb from '@/components/Breadcrumb';
import { api } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NotificacaoApi = {
	id: number;
	destinatario_id: number;
	remetente_id: number;
	tipo: 'like' | 'comentario' | 'seguindo' | string;
	post_id: number | null;
	comentario_id: number | null;
	lida: 0 | 1;
	criada_em: string;
	remetente_nome: string | null;
	remetente_foto: string | null;
};

const formatRelativeTime = (dateIso: string) => {
	const created = new Date(dateIso).getTime();
	if (Number.isNaN(created)) return '';

	const diff = Date.now() - created;
	const minutes = Math.floor(diff / (1000 * 60));

	if (minutes < 1) return 'agora';
	if (minutes < 60) return `${minutes}min atrás`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h atrás`;

	const days = Math.floor(hours / 24);
	return `${days}d atrás`;
};

const getNotificationMessage = (n: NotificacaoApi) => {
	const sender = n.remetente_nome || 'Alguém';

	if (n.tipo === 'like') return `${sender} curtiu seu post`;
	if (n.tipo === 'comentario') return `${sender} comentou no seu post`;
	if (n.tipo === 'seguindo') return `${sender} começou a seguir você`;

	return `${sender} interagiu com você`;
};

export default function Notificacoes() {
	const router = useRouter();
	const [darkMode, setDarkMode] = useState(false);
	const [notificacoes, setNotificacoes] = useState<NotificacaoApi[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const notificacoesRef = useRef<NotificacaoApi[]>([]);
	const userIdRef = useRef<number | null>(null);

	const theme = darkMode
		? {
			background: '#090B0E',
			textPrimary: '#F5F5F7',
			textSecondary: '#B8BBC2',
			card: '#12161C',
			cardUnread: '#1C2635',
			border: '#252B35',
			badgeUnread: '#3B82F6',
			iconOuter: '#101318',
			iconInner: '#0B0E12',
			iconBorder: '#14181E',
			iconColor: '#191B1F',
		}
		: {
			background: '#D9D9D9',
			textPrimary: '#111111',
			textSecondary: '#4F4F4F',
			card: '#EFEFEF',
			cardUnread: '#DCEBFF',
			border: '#C2C7CF',
			badgeUnread: '#1D4ED8',
			iconOuter: '#CFCFCF',
			iconInner: '#EFEFEF',
			iconBorder: '#BDBDBD',
			iconColor: '#333333',
		};

	const carregarNotificacoes = async (showLoading = true): Promise<NotificacaoApi[]> => {
		try {
			if (showLoading) setLoading(true);

			const userId = await AsyncStorage.getItem('userId');
			if (!userId) {
				setNotificacoes([]);
				return [];
			}

			const { data } = await api.get(`/notificacoes/${userId}`);
			const notificacoesCarregadas = Array.isArray(data) ? data : [];
			setNotificacoes(notificacoesCarregadas);
			return notificacoesCarregadas;
		} catch (error) {
			console.log('Erro ao buscar notificações:', error);
			return [];
		} finally {
			if (showLoading) setLoading(false);
			setRefreshing(false);
		}
	};

	const marcarTodasComoLidas = async (listaNotificacoes: NotificacaoApi[], destinatarioId: number) => {
		try {
			const naoLidas = listaNotificacoes.filter((n) => n.lida === 0 || String(n.lida) === '0');
			if (naoLidas.length === 0) return;

			await Promise.all(
				naoLidas
					.filter((n) => Number.isFinite(Number(n.id)))
					.map((n) =>
						api.put(`/notificacoes/${Number(n.id)}/lida`, {
							destinatario_id: destinatarioId,
						})
					)
			);

			setNotificacoes((prev) =>
				prev.map((n) => (n.lida === 0 ? { ...n, lida: 1 } : n))
			);
		} catch (error) {
			console.log('Erro ao marcar notificações como lidas:', error);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await carregarNotificacoes(false);
	};

	const excluirNotificacao = async (idNotificacao: number) => {
		try {
			const destinatarioId = userIdRef.current;
			if (!destinatarioId) return;

			await api.delete(`/notificacoes/${idNotificacao}`, {
				data: {
					destinatario_id: destinatarioId,
				},
			});

			setNotificacoes((prev) => prev.filter((n) => n.id !== idNotificacao));
		} catch (error) {
			console.log('Erro ao excluir notificação:', error);
		}
	};

	const confirmarExclusaoNotificacao = (idNotificacao: number) => {
		Alert.alert(
			'Notificação',
			'Deseja excluir esta notificação?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir notificação',
					style: 'destructive',
					onPress: () => {
						void excluirNotificacao(idNotificacao);
					},
				},
			],
			{ cancelable: true }
		);
	};

	const excluirTodasNotificacoes = async () => {
		try {
			const destinatarioId = userIdRef.current;
			if (!destinatarioId) return;

			await api.delete(`/notificacoes/usuario/${destinatarioId}`);
			setNotificacoes([]);
		} catch (error) {
			console.log('Erro ao excluir todas as notificações:', error);
		}
	};

	const confirmarExclusaoTodas = () => {
		Alert.alert(
			'Excluir todas',
			'Deseja excluir todas as notificações?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir todas',
					style: 'destructive',
					onPress: () => {
						void excluirTodasNotificacoes();
					},
				},
			],
			{ cancelable: true }
		);
	};

	useEffect(() => {
		notificacoesRef.current = notificacoes;
	}, [notificacoes]);

	useFocusEffect(
		useCallback(() => {
			const loadInitialData = async () => {
				try {
					const savedTheme = await AsyncStorage.getItem('tema');
					setDarkMode(savedTheme === 'escuro');

					const userId = await AsyncStorage.getItem('userId');
					if (!userId) {
						userIdRef.current = null;
						setNotificacoes([]);
						return;
					}

					userIdRef.current = Number(userId);
					await carregarNotificacoes();
				} catch (error) {
					console.log('Erro ao carregar notificações:', error);
				}
			};

			loadInitialData();

			return () => {
				const destinatarioId = userIdRef.current;
				if (!destinatarioId) return;

				void marcarTodasComoLidas(notificacoesRef.current, destinatarioId);
			};
		}, [])
	);

	const renderNotificacao = ({ item }: { item: NotificacaoApi }) => (
		<TouchableOpacity
			activeOpacity={0.8}
			onLongPress={() => confirmarExclusaoNotificacao(item.id)}
			style={[
				styles.notificationCard,
				{
					backgroundColor: item.lida === 0 ? theme.cardUnread : theme.card,
					borderColor: theme.border,
				},
			]}
		>
			<Image
				source={
					item.remetente_foto
						? { uri: item.remetente_foto }
						: require('../../assets/images/default-avatar.png')
				}
				style={styles.avatar}
			/>

			<View style={styles.notificationContent}>
				<Text style={[styles.notificationText, { color: theme.textPrimary }]}>{getNotificationMessage(item)}</Text>
				<Text style={[styles.notificationTime, { color: theme.textSecondary }]}>{formatRelativeTime(item.criada_em)}</Text>
			</View>

			{item.lida === 0 ? <View style={[styles.unreadDot, { backgroundColor: theme.badgeUnread }]} /> : null}
		</TouchableOpacity>
	);

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
						textColor={theme.textSecondary}
						containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
					/>
				</View>

				<Text style={[styles.title, { color: theme.textPrimary }]}>Notificações</Text>

				{notificacoes.length > 0 ? (
					<TouchableOpacity
						style={[styles.deleteAllButton, { borderColor: theme.border, backgroundColor: theme.card }]}
						onPress={confirmarExclusaoTodas}
					>
						<Ionicons name="trash-outline" size={16} color={theme.textPrimary} />
						<Text style={[styles.deleteAllText, { color: theme.textPrimary }]}>Excluir todas</Text>
					</TouchableOpacity>
				) : null}

				{loading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.textPrimary} />
					</View>
				) : notificacoes.length > 0 ? (
					<FlatList
						data={notificacoes}
						renderItem={renderNotificacao}
						keyExtractor={(item) => String(item.id)}
						contentContainerStyle={styles.listContent}
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				) : (
					<View style={styles.emptyStateContainer}>
						<View style={[styles.iconOuterCircle, { backgroundColor: theme.iconOuter }]}>
							<View style={[styles.iconInnerCircle, { backgroundColor: theme.iconInner, borderColor: theme.iconBorder }]}>
								<Ionicons name="notifications-outline" size={88} color={theme.iconColor} />
							</View>
						</View>

						<Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Nenhuma notificação</Text>
						<Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
							Ao receber notificações elas apareceram aqui
						</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: 14,
		paddingTop: 8,
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
		fontSize: 36,
		fontWeight: '700',
		letterSpacing: -0.6,
		marginBottom: 4,
	},
	deleteAllButton: {
		alignSelf: 'flex-end',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 8,
	},
	deleteAllText: {
		fontSize: 14,
		fontWeight: '700',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContent: {
		paddingBottom: 20,
	},
	notificationCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 10,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
	},
	notificationContent: {
		flex: 1,
	},
	notificationText: {
		fontSize: 15,
		fontWeight: '600',
		marginBottom: 4,
	},
	notificationTime: {
		fontSize: 13,
	},
	unreadDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	emptyStateContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 70,
	},
	iconOuterCircle: {
		width: 206,
		height: 206,
		borderRadius: 103,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 26,
	},
	iconInnerCircle: {
		width: 152,
		height: 152,
		borderRadius: 76,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	emptyTitle: {
		fontSize: 38,
		fontWeight: '500',
		marginBottom: 8,
		letterSpacing: -0.3,
		textAlign: 'center',
		width: '100%',
	},
	emptySubtitle: {
		fontSize: 20,
		textAlign: 'center',
		lineHeight: 26,
	},
});
