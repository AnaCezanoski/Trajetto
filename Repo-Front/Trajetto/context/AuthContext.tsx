import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { LoginRequest, RegisterRequest, User } from '../types/user';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef<(() => Promise<void>) | null>(null);

  const logout = async () => {
    try { await api.post('/user/logout'); } catch {}
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
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

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('Token expirado — deslogando...');
          await logoutRef.current?.();
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
