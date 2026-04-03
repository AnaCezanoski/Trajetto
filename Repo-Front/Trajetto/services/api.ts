import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ip = '172.20.10.5'; // IP do seu PC

export const api = axios.create({
    // Usar o IP do seu PC aqui (o celular nao roda no localhost com o backend)
    baseURL: `http://${ip}:8080`,
    headers: { 'Content-Type': 'application/json' },
})

    // Injeta o token em toda requisição automaticamente
    api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

export default api;