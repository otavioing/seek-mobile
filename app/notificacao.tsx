import { View, Text } from 'react-native';
import { EmptyState } from './EmptyState';

export default function Notificacoes() {

  const temNotificacao = false;

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F', padding: 20 }}>

      {/* TÍTULO */}
      <Text style={{
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20
      }}>
        Notificações
      </Text>

      {/* CONTEÚDO */}
      {temNotificacao ? (
        <View>
          {/* lista aqui */}
        </View>
      ) : (
        <EmptyState
          icon="notifications-none"
          title="Nenhuma notificação"
          subtitle="Ao receber notificações elas aparecerão aqui"
        />
      )}

    </View>
  );
}