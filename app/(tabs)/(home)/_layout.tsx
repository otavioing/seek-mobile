import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Cria o navegador de abas superiores
const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function HomeTopLayout() {
  return (
    // SafeAreaView para garantir que as abas fiquem abaixo da barra de status
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { backgroundColor: 'black' },
          tabBarIndicatorStyle: { backgroundColor: 'white', height: 3 },
          tabBarLabelStyle: {
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 'bold',
          },
        }}
      >
        {/* O nome "principal" aqui corresponde ao arquivo "principal.tsx" */}
        <MaterialTopTabs.Screen name="principal" options={{ title: 'Explorar' }} />
        
        {/* O nome "tendencias" aqui corresponde ao arquivo "tendencias.tsx" */}
        <MaterialTopTabs.Screen name="tendencias" options={{ title: 'Tendências' }} />

        <MaterialTopTabs.Screen name="seguindo" options={{ title: 'Seguindo' }} />

        {/* Você pode criar um arquivo "seguindo.tsx" se quiser */}
        {/* <MaterialTopTabs.Screen name="seguindo" options={{ title: 'Seguindo' }} /> */}
      </MaterialTopTabs>
    </SafeAreaView>
  );
}