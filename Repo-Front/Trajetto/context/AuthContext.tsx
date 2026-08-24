import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authService, userService } from '../services';
import { LoginRequest, RegisterRequest, User } from '../types/user';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef<(() => Promise<void>) | null>(null);

  const logout = async () => {
    // Limpa local ANTES de qualquer chamada de rede
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);

    // Tenta avisar o backend mas ignora qualquer erro
    try {
      await authService.logout();
    } catch {}
  };

  logoutRef.current = logout;

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (token && savedUser) setUser(JSON.parse(savedUser));
      } catch {}
      setLoading(false);
    })();

    // Desloga quando a API avisa que a sessão não vale mais (contrato de erro OB03.2).
    // Quem reconhece esse aviso é a camada de serviços; aqui só reagimos a ele.
    const unsubscribe = authService.onSessionExpired(async () => {
      await logoutRef.current?.();
    });

    return unsubscribe;
  }, []);

  const login = async (data: LoginRequest) => {
    const { token, user } = await authService.login(data);
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
  };

  const refreshUser = async () => {
    const freshUser = await userService.getProfile();
    await AsyncStorage.setItem('user', JSON.stringify(freshUser));
    setUser(freshUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
