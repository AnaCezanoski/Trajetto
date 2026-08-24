// Dados de usuário: o perfil de quem está logado e a administração da lista de usuários.

import { User } from '../types/user';
import { api } from './api';

/** Campos que o usuário pode alterar no próprio cadastro. */
export interface ProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null;
  country: string;
  telephone: string;
}

export const userService = {
  // ─── Usuário logado ──────────────────────────────────────────────────────
  /** Cadastro atualizado de quem está logado. */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/user/me');
    return response.data;
  },

  /** Salva as alterações do próprio cadastro. */
  updateProfile: async (data: ProfileRequest): Promise<User> => {
    const response = await api.put<User>('/user/me', data);
    return response.data;
  },

  /** Guarda o resultado do teste de perfil de viajante ('SKIPPED' quando é pulado). */
  updateTravelerProfile: async (travelerProfile: string): Promise<User> => {
    const response = await api.put<User>('/user/me', { travelerProfile });
    return response.data;
  },

  // ─── Administração ───────────────────────────────────────────────────────
  /** Lista todos os usuários cadastrados (somente administradores). */
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/user');
    return response.data;
  },

  /** Altera o cadastro de outro usuário (somente administradores). */
  update: async (id: number, data: ProfileRequest): Promise<User> => {
    const response = await api.patch<User>(`/user/${id}`, data);
    return response.data;
  },

  /** Promove a administrador ou rebaixa a cliente. */
  updateRole: async (id: number, isAdmin: boolean): Promise<void> => {
    await api.put(`/user/${id}/role`, { isAdmin });
  },

  /** Exclui um usuário. */
  remove: async (id: number): Promise<void> => {
    await api.delete(`/user/${id}`);
  },
};
