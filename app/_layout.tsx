import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PostsProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }}/>
              <Stack.Screen name="index" options={{ headerShown: false }}/>
              <Stack.Screen name="menuUser" options={{ headerShown: false }}/>
              <Stack.Screen name="config" options={{ headerShown: false }}/>
              <Stack.Screen name="privacidade" options={{ headerShown: false }}/>
              <Stack.Screen name="filtrarV" options={{ headerShown: false }}/>
              <Stack.Screen name="filtrarC" options={{ headerShown: false }}/>
              <Stack.Screen name="filtrarP" options={{ headerShown: false }}/>
              <Stack.Screen name="cadastro" options={{ headerShown: false }}/>
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