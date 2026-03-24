import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function EmptyState({ icon, title, subtitle }: any) {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>

      <MaterialIcons
        name={icon}
        size={100}
        color="rgba(255,255,255,0.1)"
      />

      <Text style={{
        color: '#fff',
        fontSize: 16,
        marginTop: 20
      }}>
        {title}
      </Text>

      <Text style={{
        color: '#aaa',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center'
      }}>
        {subtitle}
      </Text>

    </View>
  );
}