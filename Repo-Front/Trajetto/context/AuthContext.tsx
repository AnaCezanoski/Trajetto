import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { User, LoginRequest, RegisterRequest } from '../types/user';

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

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      if (token && savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    })();
  }, []);

//   const login = async (data: LoginRequest) => {
//     const response = await api.post('/user/login', data);
//     const { token, user } = response.data;
//     await AsyncStorage.setItem('token', token);
//     await AsyncStorage.setItem('user', JSON.stringify(user));
//     setUser(user);
//   };

  const login = async (data: LoginRequest) => {
    try {
      const response = await api.post('/user/login', data);
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      console.log('ERRO LOGIN:', JSON.stringify(error.response?.data));
      console.log('STATUS:', error.response?.status);
      console.log('URL:', error.config?.baseURL + error.config?.url);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    await api.post('/user/create', data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);