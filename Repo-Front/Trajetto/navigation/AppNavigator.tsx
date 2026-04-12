import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Telas públicas
import LoginScreen from '../app/LoginScreen';
import RegisterScreen from '../app/RegisterScreen';

// Telas usuário comum
import ProfileScreen from '../app/ProfileScreen';
import ExploreScreen from '../app/ExploreScreen';
import SpotDetailScreen from '../app/SpotDetailScreen';

// Telas admin
import UserListScreen from '../app/admin/UserListScreen';
import UserDetailScreen from '../app/admin/UserDetailScreen';

const Stack = createNativeStackNavigator();

function PublicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ headerShown: true, title: 'Criar Conta' }} />
    </Stack.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen}
        options={{ title: 'Meu Perfil' }} />
      <Stack.Screen name="Explore" component={ExploreScreen}
        options={{ title: 'Explorar', headerShown: false }} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen}
        options={{ title: 'Detalhes', headerBackTitle: 'Voltar' }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UserList" component={UserListScreen}
        options={{ title: 'Usuários' }} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen}
        options={{ title: 'Editar Usuário' }} />
      <Stack.Screen name="Explore" component={ExploreScreen}
        options={{ title: 'Explorar', headerShown: false }} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen}
        options={{ title: 'Detalhes', headerBackTitle: 'Voltar' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user && <PublicStack />}
      {user && !user.isAdmin && <UserStack />}
      {user && user.isAdmin && <AdminStack />}
    </NavigationContainer>
  );
}
