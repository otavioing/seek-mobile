import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, withLayoutContext } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from "react-native-svg";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

type Theme = {
  background: string;
  header: string;
  iconButton: string;
  icon: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  indicator: string;
  path: string;
};

export default function HomeTopLayout() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const theme: Theme = darkMode
    ? {
        background: '#0F0F0F',
        header: '#0F0F0F',
        iconButton: '#313131',
        icon: '#FFFFFF',
        tabBar: '#0F0F0F',
        tabActive: '#FFFFFF',
        tabInactive: '#888888',
        indicator: '#FFFFFF',
        path: '#FFFFFF',
      }
    : {
        background: '#E6E6E6',
        header: '#E6E6E6',
        iconButton: '#D0D0D0',
        icon: '#111111',
        tabBar: '#E6E6E6',
        tabActive: '#111111',
        tabInactive: '#666666',
        indicator: '#111111',
        path: '#111111',
      };

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('tema');
      setDarkMode(savedTheme === 'escuro');
    } catch (error) {
      console.log('Erro ao carregar tema:', error);
    }
  };

  useEffect(() => {
    loadTheme();

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        loadTheme();
      }
    });

    return () => subscription.remove();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTheme();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      <TopTabs
        tabBar={(props) => (
          <View style={[styles.headerContainer, { backgroundColor: theme.header }]}>
            <TouchableOpacity
              onPress={() => router.push('/filtrarP')}
              style={[styles.iconButton, { marginRight: 8, backgroundColor: theme.iconButton }]}
            >
              <Svg width={18} height={18} viewBox="0 0 20 23" fill="none">
                <Path d="M1.06396 3.28613H14.3981" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
                <Path d="M1.06396 11.0642H7.73104" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
                <Path d="M12.1758 11.0642H18.8429" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
                <Path d="M5.50977 18.8413H18.8439" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
                <Path d="M16.6203 5.5085C17.8477 5.5085 18.8427 4.51361 18.8427 3.28635C18.8427 2.0591 17.8477 1.06421 16.6203 1.06421C15.3929 1.06421 14.3979 2.0591 14.3979 3.28635C14.3979 4.51361 15.3929 5.5085 16.6203 5.5085Z" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
                <Path d="M9.95429 13.2866C11.1817 13.2866 12.1766 12.2917 12.1766 11.0644C12.1766 9.83717 11.1817 8.84229 9.95429 8.84229C8.72692 8.84229 7.73193 9.83717 7.73193 11.0644C7.73193 12.2917 8.72692 13.2866 9.95429 13.2866Z" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
                <Path d="M3.28632 21.0642C4.5137 21.0642 5.50868 20.0693 5.50868 18.842C5.50868 17.6148 4.5137 16.6199 3.28632 16.6199C2.05895 16.6199 1.06396 17.6148 1.06396 18.842C1.06396 20.0693 2.05895 21.0642 3.28632 21.0642Z" stroke={theme.path} strokeWidth={2.12819} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <MaterialTopTabBar {...props} />
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(tabs)/(home)/tendencias', params: { focusSearch: '1' } })}
              style={[styles.iconButton, { backgroundColor: theme.iconButton }]}
            >
              <MaterialIcons name="search" size={20} color={theme.icon} />
            </TouchableOpacity>

          </View>
        )}

        screenOptions={{
          swipeEnabled: false,
          tabBarActiveTintColor: theme.tabActive,
          tabBarInactiveTintColor: theme.tabInactive,
          tabBarIndicatorStyle: { backgroundColor: theme.indicator, height: 3 },
          tabBarLabelStyle: {
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            shadowOpacity: 0,
            elevation: 0,
            borderWidth: 0,
          }
        }}
      >
        <TopTabs.Screen name="principal" options={{ title: 'Explorar' }} />
        <TopTabs.Screen name="tendencias" options={{ title: 'Em Alta' }} />
        <TopTabs.Screen name="seguindo" options={{ title: 'Seguindo' }} />
      </TopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    borderRadius: 50,
    padding: 6,
  },
});
