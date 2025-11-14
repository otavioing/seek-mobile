import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }}/>
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="menuUser" options={{ headerShown: false }}/>
        <Stack.Screen name="config" options={{ headerShown: false }}/>
        <Stack.Screen name="filtrarV" options={{ headerShown: false }}/>
        <Stack.Screen name="filtrarC" options={{ headerShown: false }}/>
        <Stack.Screen name="filtrarP" options={{ headerShown: false }}/>
        <Stack.Screen name="cadastro" options={{ headerShown: false }}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
