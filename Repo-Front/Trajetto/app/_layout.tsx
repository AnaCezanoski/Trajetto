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

    const publicRoutes = ['LoginScreen', 'RegisterScreen', 'ForgotPasswordScreen', 'ResetPasswordScreen'];
    const inPublic = publicRoutes.includes(segments[0]);
    const inQuizFlow  = ['TravelerTestScreen', 'QuizScreen', 'QuizResultScreen'].includes(segments[0] as string);
    const inTabs      = segments[0] === '(tabs)';

    const needsQuiz = !user?.isAdmin && (!user?.travelerProfile || user.travelerProfile === 'SKIPPED');

    if (!user && !inPublic) {
      router.replace('/LoginScreen');
    } else if (user && inPublic) {
      if (user.isAdmin) {
        router.replace('/UserListScreen');
      } else if (needsQuiz) {
        router.replace('/TravelerTestScreen');
      } else {
        router.replace('/(tabs)');
      }
    } else if (user?.isAdmin && inTabs) {
      router.replace('/UserListScreen');
    }
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"       options={{ headerShown: false, headerBackTitle: '' }} />
        <Stack.Screen name="(itinerary)" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen"  options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen"  options={{ title: 'Criar Conta', headerBackTitle: '' }} />
        <Stack.Screen name="UserListScreen"  options={{ title: 'Usuários', headerBackTitle: '' }} />
        <Stack.Screen name="UserDetailScreen" options={{ title: 'Editar Usuário', headerBackTitle: '' }} />
        <Stack.Screen name="ForgotPasswordScreen" options={{ title: 'Esqueci a Senha', headerBackTitle: '' }} />
        <Stack.Screen name="ResetPasswordScreen" options={{ title: 'Redefinir Senha', headerBackTitle: '' }} />
        <Stack.Screen name="TravelerTestScreen" options={{ headerShown: false }} />
        <Stack.Screen name="QuizScreen"       options={{ headerShown: false }} />
        <Stack.Screen name="QuizResultScreen" options={{ headerShown: false }} />
        <Stack.Screen name="perfil"            options={{ title: 'My Profile', headerBackTitle: '' }} />
        <Stack.Screen name="ExploreScreen"    options={{ title: 'Explorar', headerBackTitle: '' }} />
        <Stack.Screen name="SpotDetailScreen" options={{ title: 'Detalhe', headerBackTitle: '' }} />
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