import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '@/services';
import { validateEmail } from '@/utils/validators';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type ForgotPasswordData = {
  email: string;
  loading: boolean;
  errors: Record<string, string>;
  onChangeEmail: (t: string) => void;
  handleSend: () => Promise<void>;
};

export function useForgotPassword(): ForgotPasswordData {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSend = async () => {
    const error = validateEmail(email);
    if (error) {
      setErrors({ email: error });
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      await authService.requestPasswordCode(email);
      showAlert('Verifique seu e-mail e insira o código na próxima tela.', {
        title: 'Código enviado!',
        buttons: [
          {
            text: 'OK',
            onPress: () => router.push({ pathname: '/ResetPasswordScreen', params: { email: email.trim().toLowerCase() } }),
          },
        ],
      });
    } catch (error) {
      showAlert(getErrorMessage(error, 'Não foi possível enviar o código. Verifique se o e-mail está cadastrado.'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    loading,
    errors,
    onChangeEmail: (t) => {
      setEmail(t);
      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    },
    handleSend,
  };
}
