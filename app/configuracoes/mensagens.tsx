import Breadcrumb from '@/components/Breadcrumb';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Conversa = {
	id: number;
	nome: string;
	ultimaMensagem: string;
	hora: string;
	naoLida: boolean;
	online: boolean;
};

const conversasMock: Conversa[] = [
	{
		id: 1,
		nome: 'Ana Paula',
		ultimaMensagem: 'Conseguiu ver o projeto de UX?',
		hora: '09:14',
		naoLida: true,
		online: true,
	},
	{
		id: 2,
		nome: 'Rafael Souza',
		ultimaMensagem: 'Fechamos o cronograma da sprint.',
		hora: 'Ontem',
		naoLida: false,
		online: false,
	},
	{
		id: 3,
		nome: 'Time SEEK',
		ultimaMensagem: 'Novo feedback no seu post.',
		hora: 'Seg',
		naoLida: true,
		online: false,
	},
	{
		id: 4,
		nome: 'Marina Costa',
		ultimaMensagem: 'Posso te ligar em 10min?',
		hora: 'Dom',
		naoLida: false,
		online: true,
	},
];

export default function Mensagens() {
	const router = useRouter();
	const [darkMode, setDarkMode] = useState(true);
	const [busca, setBusca] = useState('');
	const [filtroNaoLidas, setFiltroNaoLidas] = useState(false);

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

	useFocusEffect(
		useCallback(() => {
			void carregarTema();
		}, [carregarTema])
	);

	const theme = darkMode
		? {
				background: '#090B0E',
				textPrimary: '#F5F5F7',
				textSecondary: '#A8AFBA',
				searchBackground: '#171C23',
				searchBorder: '#242C38',
				card: '#11161D',
				cardUnread: '#1B2637',
				border: '#242D39',
				badge: '#3B82F6',
				avatar: '#1F2937',
				online: '#22C55E',
				filterChip: '#1A202A',
				filterChipActive: '#2563EB',
				emptyIcon: '#2B3340',
			}
		: {
				background: '#D9D9D9',
				textPrimary: '#111111',
				textSecondary: '#4F5560',
				searchBackground: '#FFFFFF',
				searchBorder: '#C2C7CF',
				card: '#EFEFEF',
				cardUnread: '#DCEBFF',
				border: '#C2C7CF',
				badge: '#1D4ED8',
				avatar: '#C9CDD4',
				online: '#15803D',
				filterChip: '#ECECEC',
				filterChipActive: '#111111',
				emptyIcon: '#B7BEC8',
			};

	const conversasFiltradas = useMemo(() => {
		const texto = busca.trim().toLowerCase();

		return conversasMock.filter((conversa) => {
			const correspondeBusca =
				!texto ||
				conversa.nome.toLowerCase().includes(texto) ||
				conversa.ultimaMensagem.toLowerCase().includes(texto);

			const correspondeFiltro = !filtroNaoLidas || conversa.naoLida;

			return correspondeBusca && correspondeFiltro;
		});
	}, [busca, filtroNaoLidas]);

	const renderConversa = ({ item }: { item: Conversa }) => (
		<TouchableOpacity
			activeOpacity={0.85}
			style={[
				styles.card,
				{
					backgroundColor: item.naoLida ? theme.cardUnread : theme.card,
					borderColor: theme.border,
				},
			]}
		>
			<View style={[styles.avatar, { backgroundColor: theme.avatar }]}> 
				<Text style={[styles.avatarText, { color: theme.textPrimary }]}>{item.nome.slice(0, 1)}</Text>
				{item.online ? <View style={[styles.onlineDot, { backgroundColor: theme.online }]} /> : null}
			</View>

			<View style={styles.cardContent}>
				<View style={styles.cardTopRow}>
					<Text numberOfLines={1} style={[styles.nome, { color: theme.textPrimary }]}>
						{item.nome}
					</Text>
					<Text style={[styles.hora, { color: theme.textSecondary }]}>{item.hora}</Text>
				</View>

				<View style={styles.cardBottomRow}>
					<Text numberOfLines={1} style={[styles.ultimaMensagem, { color: theme.textSecondary }]}>
						{item.ultimaMensagem}
					</Text>
					{item.naoLida ? <View style={[styles.unreadBadge, { backgroundColor: theme.badge }]} /> : null}
				</View>
			</View>
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
							{ label: 'Mensagens' },
						]}
						textColor={theme.textSecondary}
						containerStyle={{ marginBottom: 0, marginLeft: 8, flex: 1 }}
					/>
				</View>

				<Text style={[styles.title, { color: theme.textPrimary }]}>Mensagens</Text>

				<View style={[styles.searchBox, { backgroundColor: theme.searchBackground, borderColor: theme.searchBorder }]}> 
					<Ionicons name="search-outline" size={18} color={theme.textSecondary} />
					<TextInput
						value={busca}
						onChangeText={setBusca}
						placeholder="Buscar conversa"
						placeholderTextColor={theme.textSecondary}
						style={[styles.searchInput, { color: theme.textPrimary }]}
					/>
				</View>

				<View style={styles.filtersRow}>
					<TouchableOpacity
						onPress={() => setFiltroNaoLidas(false)}
						style={[
							styles.chip,
							{
								backgroundColor: !filtroNaoLidas ? theme.filterChipActive : theme.filterChip,
							},
						]}
					>
						<Text style={[styles.chipText, { color: !filtroNaoLidas ? '#F5F5F7' : theme.textPrimary }]}>Todas</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => setFiltroNaoLidas(true)}
						style={[
							styles.chip,
							{
								backgroundColor: filtroNaoLidas ? theme.filterChipActive : theme.filterChip,
							},
						]}
					>
						<Text style={[styles.chipText, { color: filtroNaoLidas ? '#F5F5F7' : theme.textPrimary }]}>Não lidas</Text>
					</TouchableOpacity>
				</View>

				{conversasFiltradas.length > 0 ? (
					<FlatList
						data={conversasFiltradas}
						renderItem={renderConversa}
						keyExtractor={(item) => String(item.id)}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
					/>
				) : (
					<View style={styles.emptyContainer}>
						<Ionicons name="chatbubbles-outline" size={74} color={theme.emptyIcon} />
						<Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Nada por aqui</Text>
						<Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}> 
							Nenhuma conversa encontrada com esse filtro.
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
		fontSize: 34,
		fontWeight: '700',
		letterSpacing: -0.6,
		marginBottom: 10,
	},
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 12,
		height: 46,
		marginBottom: 10,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		marginLeft: 8,
	},
	filtersRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 10,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
	},
	chipText: {
		fontSize: 13,
		fontWeight: '700',
	},
	listContent: {
		paddingBottom: 18,
	},
	card: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 12,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	avatarText: {
		fontSize: 18,
		fontWeight: '700',
	},
	onlineDot: {
		position: 'absolute',
		right: 1,
		bottom: 2,
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	cardContent: {
		flex: 1,
		marginLeft: 10,
	},
	cardTopRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	nome: {
		flex: 1,
		fontSize: 15,
		fontWeight: '700',
	},
	hora: {
		fontSize: 12,
		fontWeight: '600',
	},
	cardBottomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
		gap: 8,
	},
	ultimaMensagem: {
		flex: 1,
		fontSize: 13,
	},
	unreadBadge: {
		width: 9,
		height: 9,
		borderRadius: 5,
	},
	emptyContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		paddingBottom: 50,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: '700',
		marginTop: 10,
	},
	emptySubtitle: {
		fontSize: 14,
		textAlign: 'center',
		marginTop: 6,
		lineHeight: 20,
	},
});
