// Cliente HTTP do backend — uso restrito à camada de serviços (pasta services/).
// Telas, componentes e contextos não devem importar este arquivo: eles conversam
// com o backend através dos serviços exportados em services/index.ts.
// A regra está automatizada no eslint.config.js.

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Endereço do backend em um lugar só. Trocar de servidor é editar o .env, não o código.
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Apenas o interceptor de REQUEST — injeta token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// O tratamento de sessão expirada (resposta) fica em authService.onSessionExpired,
// para que o AuthContext não precise conhecer o cliente HTTP.

export default api;
