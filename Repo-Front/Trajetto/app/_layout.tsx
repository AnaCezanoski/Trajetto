import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Righteous_400Regular } from '@expo-google-fonts/righteous';
import { FugazOne_400Regular } from '@expo-google-fonts/fugaz-one';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;


export const unstable_settings = { anchor: '(tabs)' };

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'Righteous': Righteous_400Regular,
    'FugazOne': FugazOne_400Regular,
  });
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Define a fonte Inter como padrão global para os componentes nativos
  useEffect(() => {
    if (fontsLoaded) {
      (Text as any).defaultProps = {
      ...((Text as any).defaultProps || {}),
      allowFontScaling: false,
      style: { fontFamily: 'Inter', includeFontPadding: false },
    };
    (TextInput as any).defaultProps = {
      ...((TextInput as any).defaultProps || {}),
      allowFontScaling: false,
      style: { fontFamily: 'Inter', includeFontPadding: false },
    };
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] ?? '';
    const publicRoutes = ['LoginScreen', 'RegisterScreen', 'ForgotPasswordScreen', 'ResetPasswordScreen', 'VerifyEmailScreen'];
    const inPublic = publicRoutes.includes(currentSegment);
    const inQuizFlow = ['TravelerTestScreen', 'QuizScreen', 'QuizResultScreen'].includes(currentSegment);
    const inTabs = currentSegment === '(tabs)';

    const needsQuiz = !user?.isAdmin && (!user?.travelerProfile || user.travelerProfile === 'SKIPPED');

    if (!user && !inPublic) {
      router.replace('/LoginScreen');
    } else if (user && inPublic) {
      if (user.isAdmin) {
        router.replace('/AdminPanelScreen');
      } else if (needsQuiz) {
        router.replace('/TravelerTestScreen');
      } else {
        router.replace('/(tabs)');
      }
    } else if (user?.isAdmin && inTabs) {
      router.replace('/AdminPanelScreen');
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [user, loading, segments, fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: '' }} />
        <Stack.Screen name="(itinerary)" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="UserListScreen" options={{ title: 'Usuários', headerBackTitle: '' }} />
        <Stack.Screen name="UserDetailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPasswordScreen" options={{ title: 'Esqueci a Senha', headerBackTitle: '' }} />
        <Stack.Screen name="ResetPasswordScreen" options={{ title: 'Redefinir Senha', headerBackTitle: '' }} />
        <Stack.Screen name="TravelerTestScreen" options={{ headerShown: false }} />
        <Stack.Screen name="QuizScreen" options={{ headerShown: false }} />
        <Stack.Screen name="QuizResultScreen" options={{ headerShown: false }} />
        <Stack.Screen name="perfil" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ExploreScreen" options={{ headerShown: false }} />
        <Stack.Screen name="SpotDetailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="AdminPanelScreen" options={{ headerShown: false }} />
        <Stack.Screen name="DashboardScreen" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}