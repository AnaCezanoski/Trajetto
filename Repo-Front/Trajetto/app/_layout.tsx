import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';

export const unstable_settings = { anchor: '(tabs)' };

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inLogin     = segments[0] === 'LoginScreen';
    const inRegister  = segments[0] === 'RegisterScreen';
    const inPublic    = inLogin || inRegister;
    const inQuizFlow  = ['TravelerTestScreen', 'QuizScreen', 'QuizResultScreen'].includes(segments[0] as string);
    const inTabs      = segments[0] === '(tabs)';

    const needsQuiz = !user?.travelerProfile || user.travelerProfile === 'SKIPPED';

    if (!user && !inPublic) {
      router.replace('/LoginScreen');
    } else if (user && inPublic) {
      // Momento do login: verifica se tem perfil válido
      if (needsQuiz) {
        router.replace('/TravelerTestScreen');
      } else {
        router.replace('/(tabs)');
      }
    }
    // Nota: usuário com SKIPPED que já está nas tabs NÃO é redirecionado —
    // o prompt só acontece no momento do login (inPublic → user).
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"       options={{ headerShown: false }} />
        <Stack.Screen name="(itinerary)" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen"  options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen"  options={{ title: 'Criar Conta' }} />
        <Stack.Screen name="UserListScreen"  options={{ title: 'Usuários' }} />
        <Stack.Screen name="UserDetailScreen" options={{ title: 'Editar Usuário' }} />
        <Stack.Screen name="TravelerTestScreen" options={{ headerShown: false }} />
        <Stack.Screen name="QuizScreen"       options={{ headerShown: false }} />
        <Stack.Screen name="QuizResultScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ExploreScreen"    options={{ title: 'Explorar' }} />
        <Stack.Screen name="SpotDetailScreen" options={{ title: 'Detalhe' }} />
        <Stack.Screen name="modal"            options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}