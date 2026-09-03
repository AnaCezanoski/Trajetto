import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { validateEmail } from '@/utils/validators';
import { getErrorMessage } from '@/utils/apiError';

export type LoginData = {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  errors: Record<string, string>;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  handleLogin: () => Promise<void>;
  goToForgotPassword: () => void;
  goToRegister: () => void;
};

export function useLogin(): LoginData {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    if (!password) newErrors.password = 'Senha é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setError('');
    try {
      setLoading(true);
      await login({ email, password });
    } catch (e) {
      setError(getErrorMessage(e, 'E-mail ou senha inválidos.'));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    loading,
    error,
    errors,
    setEmail,
    setPassword,
    handleLogin,
    goToForgotPassword: () => router.push('/ForgotPasswordScreen'),
    goToRegister: () => router.push('/RegisterScreen'),
  };
}
