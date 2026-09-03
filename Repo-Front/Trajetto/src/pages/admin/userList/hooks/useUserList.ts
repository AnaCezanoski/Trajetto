import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { userService } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { User } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/src/components/alerts/alertService';

export type UserListData = {
  admin: User | null;
  users: User[];
  loading: boolean;
  logout: () => Promise<void>;
  editUser: (user: User) => void;
  deleteUser: (id: number, name: string) => void;
};

export function useUserList(): UserListData {
  const { user: admin, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsers(await userService.getAll());
    } catch (e) {
      showAlert(getErrorMessage(e, 'Não foi possível carregar os usuários.'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchUsers(); }, [])
  );

  const deleteUser = (id: number, name: string) => {
    showAlert(`Deseja excluir ${name}?`, {
      title: 'Excluir usuário',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.remove(id);
              fetchUsers();
            } catch (e) {
              showAlert(getErrorMessage(e, 'Não foi possível excluir o usuário.'), { title: 'Erro' });
            }
          },
        },
      ],
    });
  };

  return {
    admin,
    users,
    loading,
    logout,
    editUser: (user) => router.push({ pathname: '/UserDetailScreen', params: { user: JSON.stringify(user) } }),
    deleteUser,
  };
}
