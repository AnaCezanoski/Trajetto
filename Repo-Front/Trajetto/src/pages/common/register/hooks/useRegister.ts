import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  maskName, maskBirthDate, maskTelephone,
  validateRegisterForm, toBirthDateISO,
} from '@/utils/validators';
import { getErrorMessage, getFieldErrors } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

type Errors = Record<string, string>;

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  country: string;
  telephone: string;
  loading: boolean;
  errors: Errors;
  showCountries: boolean;
  onChangeFirstName: (t: string) => void;
  onChangeLastName: (t: string) => void;
  onChangeBirthDate: (t: string) => void;
  onChangeTelephone: (t: string) => void;
  onChangeEmail: (t: string) => void;
  onChangePassword: (t: string) => void;
  onChangeConfirmPassword: (t: string) => void;
  onSelectCountry: (c: string) => void;
  openCountries: () => void;
  closeCountries: () => void;
  handleRegister: () => Promise<void>;
  goToLogin: () => void;
};

export function useRegister(): RegisterData {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleRegister = async () => {
    const errs = validateRegisterForm({ firstName, lastName, birthDate, telephone, email, country, password });
    if (password !== confirmPassword) {
      errs.confirmPassword = 'As senhas não coincidem';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password, birthDate: toBirthDateISO(birthDate), country, telephone });
      showAlert('Enviamos um código de verificação para o seu email.', { title: 'Quase lá!' });
      router.push({ pathname: '/VerifyEmailScreen', params: { email } });
    } catch (e) {
      const fieldErrors = getFieldErrors(e);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      showAlert(getErrorMessage(e, 'Não foi possível criar a conta'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    birthDate,
    country,
    telephone,
    loading,
    errors,
    showCountries,
    onChangeFirstName: (t) => { setFirstName(maskName(t)); clearError('firstName'); },
    onChangeLastName: (t) => { setLastName(maskName(t)); clearError('lastName'); },
    onChangeBirthDate: (t) => { setBirthDate(maskBirthDate(t)); clearError('birthDate'); },
    onChangeTelephone: (t) => { setTelephone(maskTelephone(t)); clearError('telephone'); },
    onChangeEmail: (t) => { setEmail(t); clearError('email'); },
    onChangePassword: (t) => { setPassword(t); clearError('password'); },
    onChangeConfirmPassword: (t) => { setConfirmPassword(t); clearError('confirmPassword'); },
    onSelectCountry: (c) => { setCountry(c); setShowCountries(false); clearError('country'); },
    openCountries: () => setShowCountries(true),
    closeCountries: () => setShowCountries(false),
    handleRegister,
    goToLogin: () => router.push('/LoginScreen'),
  };
}
