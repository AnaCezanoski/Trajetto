import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { userService } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { User } from '@/types/user';

export type UserDetailData = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  country: string;
  telephone: string;
  isAdmin: boolean;
  loading: boolean;
  showCountries: boolean;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;
  setBirthDate: (v: string) => void;
  setTelephone: (v: string) => void;
  onSelectCountry: (v: string) => void;
  openCountries: () => void;
  closeCountries: () => void;
  handleUpdate: () => Promise<void>;
  handleRoleChange: (newIsAdmin: boolean) => Promise<void>;
};

export function useUserDetail(): UserDetailData {
  const { user: userParam } = useLocalSearchParams();
  const user = JSON.parse(userParam as string) as User;
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [birthDate, setBirthDate] = useState(user.birthDate ?? '');
  const [country, setCountry] = useState(user.country ?? '');
  const [telephone, setTelephone] = useState(user.telephone ?? '');
  const [isAdmin, setIsAdmin] = useState<boolean>(user.isAdmin);
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await userService.update(user.id, { firstName, lastName, email, birthDate, country, telephone });
      showAlert('Usuário atualizado!', { title: 'Sucesso' });
      router.back();
    } catch (e) {
      showAlert(getErrorMessage(e, 'Não foi possível atualizar.'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newIsAdmin: boolean) => {
    try {
      await userService.updateRole(user.id, newIsAdmin);
      setIsAdmin(newIsAdmin);
    } catch (e) {
      showAlert(getErrorMessage(e, 'Não foi possível alterar o cargo.'), { title: 'Erro' });
    }
  };

  return {
    firstName,
    lastName,
    email,
    birthDate,
    country,
    telephone,
    isAdmin,
    loading,
    showCountries,
    setFirstName,
    setLastName,
    setEmail,
    setBirthDate,
    setTelephone,
    onSelectCountry: (c) => { setCountry(c); setShowCountries(false); },
    openCountries: () => setShowCountries(true),
    closeCountries: () => setShowCountries(false),
    handleUpdate,
    handleRoleChange,
  };
}
