import { api, apiErrorMessage } from '@/src/services/api';
import { FirstLoginState, loadFirstLoginState, sessionDestination } from '@/src/services/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { type Href, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CommentsProvider } from '../src/context/CommentsContext'; // 👈 IMPORTANTE
import { FollowedPostsProvider } from '../src/context/FollowedPostsContext';
import { PostsProvider } from '../src/context/PostsContext';
import { StoriesProvider } from '../src/context/StoriesContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!loaded) return;
    let active = true;
    const checkLogin = async () => {
      setCheckingAuth(true); setAuthError('');
      try {
        let session: FirstLoginState | null = null;
        if (await AsyncStorage.getItem('session')) {
          session = await loadFirstLoginState();
          if (!active) return;
          await AsyncStorage.setItem('userId', String(session.user.id));
        }
        if (!active) return;
        setSessionUserId(session ? String(session.user.id) : null);
        const destination = sessionDestination(session, segments[0]);
        if (destination) router.replace(destination as Href);
      } catch (error: any) {
        if (!active) return;
        if ([401, 404].includes(error.response?.status)) {
          await AsyncStorage.multiRemove(['session', 'userId', 'token']);
          if (active) { setSessionUserId(null); router.replace('/login'); }
        } else {
          setAuthError(apiErrorMessage(error, 'Não foi possível verificar seu acesso. Tente novamente.'));
        }
      } finally {
        if (active) setCheckingAuth(false);
      }
    };
    void checkLogin();
    return () => { active = false; };
  }, [segments, loaded, router, retry]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PostsProvider sessionUserId={sessionUserId}>
        <FollowedPostsProvider sessionUserId={sessionUserId}>
          <CommentsProvider sessionUserId={sessionUserId}>
            <StoriesProvider sessionUserId={sessionUserId}>
              <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                  <Stack screenOptions={{ headerShown: false }} />
                  {checkingAuth && <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#fff', justifyContent: 'center' }}><ActivityIndicator /></View>}
                  {!!authError && !checkingAuth && <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 28, gap: 22 }}>
                    <Text accessibilityRole="alert" style={{ color: '#111', textAlign: 'center' }}>{authError}</Text>
                    <TouchableOpacity accessibilityRole="button" onPress={() => setRetry(value => value + 1)}><Text style={{ color: '#322bf0', fontWeight: 'bold' }}>Tentar novamente</Text></TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" onPress={async () => {
                      try { await api.post('/auth/logout'); } catch { /* Clear the local session below. */ }
                      await AsyncStorage.multiRemove(['session', 'userId', 'token']);
                      setSessionUserId(null); setAuthError(''); router.replace('/login'); setRetry(value => value + 1);
                    }}><Text style={{ color: '#666' }}>Sair da conta</Text></TouchableOpacity>
                  </View>}
                </SafeAreaView>

                <StatusBar style="light" />
              </SafeAreaProvider>
            </StoriesProvider>
          </CommentsProvider>
        </FollowedPostsProvider>
      </PostsProvider>
    </ThemeProvider>
  );
}
