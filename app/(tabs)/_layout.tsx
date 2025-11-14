import { Tabs } from 'expo-router';
import React from 'react';
// Importe seus ícones (ajuste o caminho se necessário)
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho de todas as abas
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
        },
      }}
    >
      
      <Tabs.Screen
        name="(home)" // Isso direciona para o seu grupo de abas superiores
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="tendencias"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}