import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ip = '192.168.10.103';

export const api = axios.create({
  baseURL: `http://${ip}:8080`,
  headers: { 'Content-Type': 'application/json' },
});

// Apenas o interceptor de REQUEST — injeta token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ← REMOVIDO o interceptor de response daqui
// O 401 é tratado APENAS no AuthContext

export default api;