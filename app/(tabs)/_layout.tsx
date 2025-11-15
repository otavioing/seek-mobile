import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: false, // Sem texto, como no protótipo
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
        },

        // Esta função agora SÓ PROCURA as 3 abas que você tem
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-circle-outline'; // Ícone padrão '?'

          if (route.name === '(home)') {
            iconName = focused ? 'home' : 'home-outline';
          } 
          else if (route.name === 'cursos') {
            iconName = focused ? 'school' : 'school-outline';
          } 
          else if (route.name === 'perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          else if (route.name === 'vagas') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          }
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen 
        name="(home)" 
        options={{ title: 'Início' }} 
      />

      <Tabs.Screen 
        name="cursos" 
        options={{ title: 'Cursos' }} 
      />

      <Tabs.Screen 
        name="vagas" 
        options={{ title: 'Vagas' }} 
      />

      <Tabs.Screen 
        name="perfil" 
        options={{ title: 'Perfil' }} 
      />
    </Tabs>
  );
}