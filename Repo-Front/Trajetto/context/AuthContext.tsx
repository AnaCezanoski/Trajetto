import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { LoginRequest, RegisterRequest, User } from '../types/user';
import { getErrorCode, isSessionError } from '../utils/apiError';

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
      await api.post('/user/logout');
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

    let isLoggingOut = false; // ← fora do useEffect

    // Desloga quando a API avisa que a sessão não vale mais (contrato de erro OB03.2).
    // Antes bastava um 401 qualquer, o que derrubava a sessão até quando o 401 era só uma
    // senha errada no login (INVALID_CREDENTIALS) — agora o código do erro diz a diferença.
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (isSessionError(error) && !isLoggingOut) {
          isLoggingOut = true;
          console.log(`Sessão encerrada pela API (${getErrorCode(error) ?? 'sem código'}) — deslogando...`);
          await logoutRef.current?.();
          isLoggingOut = false;
        }
        return Promise.reject(error);
      }
    );

    return () => { api.interceptors.response.eject(interceptor); };
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await api.post('/user/login', data);
    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (data: RegisterRequest) => {
    await api.post('/user/create', data);
  };

  const refreshUser = async () => {
    const response = await api.get('/user/me');
    const freshUser = response.data as User;
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
