import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CommentsProvider } from '../src/context/CommentsContext'; // 👈 IMPORTANTE
import { FollowedPostsProvider } from '../src/context/FollowedPostsContext';
import { PostsProvider } from '../src/context/PostsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');

      const inAuthGroup = segments[0] === 'login' || segments[0] === 'cadastro';

      if (!token && !inAuthGroup) {
        router.replace('/login');
      } else if (token && inAuthGroup) {
        router.replace('/principal');
      }

      setCheckingAuth(false);
    };

    checkLogin();
  }, [segments]);

  if (!loaded || checkingAuth) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PostsProvider>
        <FollowedPostsProvider>
          <CommentsProvider> {/* 👈 AQUI RESOLVE SEU ERRO */}
            <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                <Stack screenOptions={{ headerShown: false }} />
              </SafeAreaView>

              <StatusBar style="light" />
            </SafeAreaProvider>
          </CommentsProvider>
        </FollowedPostsProvider>
      </PostsProvider>
    </ThemeProvider>
  );
}