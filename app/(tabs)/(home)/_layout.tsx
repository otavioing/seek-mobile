import { Ionicons } from '@expo/vector-icons'; // Para o ícone de filtro
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Cria o componente de Abas Superiores (Top Tabs)
const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function HomeTopLayout() {
  // Faz o ícone de filtro aparecer em TODAS as abas
  const showFilterIcon = true; 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <TopTabs
        // Usamos 'tabBar' para renderizar nosso próprio cabeçalho
        tabBar={(props) => (
          <View style={styles.headerContainer}>
            
            {/* 1. Wrapper para as abas */}
            <View style={{ flex: 1 }}>
              <MaterialTopTabBar
                {...props}
                // Esta prop é passada para 'screenOptions' abaixo
              />
            </View>
            
            {/* 2. Ícone de filtro */}
            {showFilterIcon && (
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options-outline" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        // Opções para estilizar as abas
        screenOptions={{
          swipeEnabled: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
          tabBarIndicatorStyle: { backgroundColor: 'white', height: 3 },
          tabBarLabelStyle: {
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 'bold',
          },
          // Esta é a correção para o fundo branco
          tabBarStyle: { backgroundColor: 'black' } 
        }}
      >
        {/* Suas três telas */}
        <TopTabs.Screen name="principal" options={{ title: 'Explorar' }} />
        <TopTabs.Screen name="tendencias" options={{ title: 'Tendências' }} />
        <TopTabs.Screen name="seguindo" options={{ title: 'Seguindo' }} />
      </TopTabs>
    </SafeAreaView>
  );
}

// Estilos para o cabeçalho customizado
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});