import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ip = '172.20.10.5';

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

export default api;