import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services';
import {
  maskName, maskBirthDate, maskTelephone,
  validateProfileForm, toBirthDateISO, fromBirthDateISO,
} from '@/utils/validators';
import { getErrorMessage, getFieldErrors } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

type Errors = Record<string, string>;

export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  country: string;
  telephone: string;
  loading: boolean;
  fetching: boolean;
  showCountries: boolean;
  errors: Errors;
  logout: () => Promise<void>;
  onChangeFirstName: (t: string) => void;
  onChangeLastName: (t: string) => void;
  onChangeBirthDate: (t: string) => void;
  onChangeTelephone: (t: string) => void;
  onChangeEmail: (t: string) => void;
  onSelectCountry: (c: string) => void;
  openCountries: () => void;
  closeCountries: () => void;
  handleUpdate: () => Promise<void>;
};

export function useProfile(): ProfileData {
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCountries, setShowCountries] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    userService.getProfile().then((u) => {
      setFirstName(u.firstName ?? '');
      setLastName(u.lastName ?? '');
      setEmail(u.email ?? '');
      setBirthDate(u.birthDate ? fromBirthDateISO(u.birthDate) : '');
      setCountry(u.country ?? '');
      setTelephone(u.telephone ?? '');
    }).finally(() => setFetching(false));
  }, []);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleUpdate = async () => {
    const errs = validateProfileForm({ firstName, lastName, birthDate, telephone, email, country });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      await userService.updateProfile({ firstName, lastName, email, birthDate: toBirthDateISO(birthDate), country, telephone });
      showAlert('Perfil atualizado!', { title: 'Sucesso' });
    } catch (e) {
      const fieldErrors = getFieldErrors(e);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      showAlert(getErrorMessage(e, 'Não foi possível atualizar'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    lastName,
    email,
    birthDate,
    country,
    telephone,
    loading,
    fetching,
    showCountries,
    errors,
    logout,
    onChangeFirstName: (t) => { setFirstName(maskName(t)); clearError('firstName'); },
    onChangeLastName: (t) => { setLastName(maskName(t)); clearError('lastName'); },
    onChangeBirthDate: (t) => { setBirthDate(maskBirthDate(t)); clearError('birthDate'); },
    onChangeTelephone: (t) => { setTelephone(maskTelephone(t)); clearError('telephone'); },
    onChangeEmail: (t) => { setEmail(t); clearError('email'); },
    onSelectCountry: (c) => { setCountry(c); setShowCountries(false); clearError('country'); },
    openCountries: () => setShowCountries(true),
    closeCountries: () => setShowCountries(false),
    handleUpdate,
  };
}
