// Autenticação e ciclo de vida da sessão: entrar, cadastrar, sair, verificar a conta
// e recuperar a senha. Nenhuma tela chama esses endereços diretamente.

import { LoginRequest, RegisterRequest, User } from '../types/user';
import { getErrorCode, isSessionError } from '../utils/apiError';
import { api } from './api';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

/** O servidor guarda o e-mail sempre em minúsculas — normaliza antes de enviar. */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const authService = {
  /** Troca e-mail e senha pelo token de acesso e pelos dados do usuário. */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/user/login', data);
    return response.data;
  },

  /** Cria a conta. O usuário ainda precisa confirmar o e-mail antes de entrar. */
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/user/create', data);
  },

  /** Avisa o servidor que a sessão terminou. */
  logout: async (): Promise<void> => {
    await api.post('/user/logout');
  },

  /** Confirma a conta com o código de 6 dígitos enviado por e-mail. */
  verifyEmail: async (email: string, code: string): Promise<void> => {
    await api.post('/user/verify', null, { params: { email, code } });
  },

  /** Pede o envio do código de redefinição de senha para o e-mail informado. */
  requestPasswordCode: async (email: string): Promise<void> => {
    await api.post('/user/password/forgot', { email: normalizeEmail(email) });
  },

  /** Define a nova senha usando o código recebido por e-mail. */
  resetPassword: async ({ email, code, newPassword }: ResetPasswordRequest): Promise<void> => {
    await api.post('/user/password/reset', { email: normalizeEmail(email), code, newPassword });
  },

  /**
   * Registra o que fazer quando o servidor avisar que a sessão guardada no aparelho
   * não vale mais (token vencido, adulterado ou ausente). Devolve a função que cancela
   * esse registro.
   *
   * Fica aqui, e não no AuthContext, para que o estado de autenticação da interface não
   * precise saber que existe um cliente HTTP por baixo.
   */
  onSessionExpired: (handler: () => Promise<void> | void): (() => void) => {
    let handling = false;

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (isSessionError(error) && !handling) {
          handling = true;
          console.log(`Sessão encerrada pela API (${getErrorCode(error) ?? 'sem código'}) — deslogando...`);
          try {
            await handler();
          } finally {
            handling = false;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => { api.interceptors.response.eject(interceptor); };
  },
};
