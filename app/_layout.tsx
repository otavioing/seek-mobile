import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { PostsProvider } from '../src/context/PostsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (token) {
          router.replace('/principal');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.log('Erro ao verificar login:', error);
        router.replace('/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PostsProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="menuUser" options={{ headerShown: false }} />
              <Stack.Screen name="config" options={{ headerShown: false }} />
              <Stack.Screen name="privacidade" options={{ headerShown: false }} />
              <Stack.Screen name="filtrarV" options={{ headerShown: false }} />
              <Stack.Screen name="filtrarC" options={{ headerShown: false }} />
              <Stack.Screen name="filtrarP" options={{ headerShown: false }} />
              <Stack.Screen name="cadastro" options={{ headerShown: false }} />
              <Stack.Screen name="upload" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="explore" options={{ headerShown: false }} />
              <Stack.Screen name="cursos" options={{ headerShown: false }} />
              <Stack.Screen name="vagas" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SafeAreaView>
          <StatusBar style="light" backgroundColor="#000" translucent={false} />
        </SafeAreaProvider>
      </PostsProvider>
    </ThemeProvider>
  );
}