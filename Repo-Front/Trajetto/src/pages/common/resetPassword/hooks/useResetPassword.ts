import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services';
import { validateEmail, validatePassword } from '@/utils/validators';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type ResetPasswordData = {
  email: string;
  code: string;
  password: string;
  loading: boolean;
  errors: Record<string, string>;
  onChangeEmail: (t: string) => void;
  onChangeCode: (t: string) => void;
  onChangePassword: (t: string) => void;
  handleReset: () => Promise<void>;
};

export function useResetPassword(): ResetPasswordData {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleReset = async () => {
    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    if (!code) newErrors.code = 'O código é obrigatório.';
    else if (!/^\d{6}$/.test(code)) newErrors.code = 'O código deve ter exatamente 6 dígitos.';
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      await authService.resetPassword({ email, code, newPassword: password });
      showAlert('Senha redefinida!', {
        title: 'Sucesso',
        buttons: [{ text: 'OK', onPress: () => router.replace('/LoginScreen') }],
      });
    } catch (error) {
      showAlert(getErrorMessage(error, 'Código inválido ou expirado'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    code,
    password,
    loading,
    errors,
    onChangeEmail: (t) => { setEmail(t); clearError('email'); },
    onChangeCode: (t) => { setCode(t.replace(/\D/g, '')); clearError('code'); },
    onChangePassword: (t) => { setPassword(t); clearError('password'); },
    handleReset,
  };
}
