import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inTabs = segments[0] === '(tabs)';
    const inLogin = segments[0] === 'LoginScreen';
    const inRegister = segments[0] === 'RegisterScreen';
    const inPublic = inLogin || inRegister;

    if (!user && !inPublic) {
      router.replace('/LoginScreen');
    } else if (user && inPublic) {
      if (user.isAdmin) {
        router.replace('/UserListScreen');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" options={{ title: 'Criar Conta' }} />
        <Stack.Screen name="UserListScreen" options={{ title: 'Usuários' }} />
        <Stack.Screen name="UserDetailScreen" options={{ title: 'Editar Usuário' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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