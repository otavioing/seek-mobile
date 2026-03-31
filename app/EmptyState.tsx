import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// ADICIONADO O "DEFAULT" AQUI:
export default function EmptyState({ icon, title, subtitle }: any) {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20 // Adicionado um respiro lateral
    }}>

      <MaterialIcons
        name={icon || "error-outline"} // Fallback caso o ícone venha vazio
        size={100}
        color="rgba(255,255,255,0.1)"
      />

      {/* Dica: Usar {title && <Text>...} evita que o React Native tente 
        renderizar uma string vazia ou undefined fora de um <Text>, 
        que causa aquele erro de "Text strings must be rendered..."
      */}
      {title ? (
        <Text style={{
          color: '#fff',
          fontSize: 16,
          marginTop: 20,
          fontWeight: 'bold'
        }}>
          {title}
        </Text>
      ) : null}

      {subtitle ? (
        <Text style={{
          color: '#aaa',
          fontSize: 12,
          marginTop: 5,
          textAlign: 'center'
        }}>
          {subtitle}
        </Text>
      ) : null}

    </View>
  );
}