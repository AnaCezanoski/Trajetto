import { useState } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type VerifyEmailData = {
  email: string;
  code: string;
  loading: boolean;
  handleVerify: (manualCode?: string) => Promise<void>;
  handleChangeCode: (text: string) => void;
};

export function useVerifyEmail(): VerifyEmailData {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const emailStr = String(email ?? '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (manualCode?: string) => {
    const codeToVerify = manualCode ?? code;
    Keyboard.dismiss();
    if (codeToVerify.length < 6) {
      showAlert('Digite os 6 dígitos do código.', { title: 'Atenção' });
      return;
    }
    setLoading(true);
    try {
      await authService.verifyEmail(emailStr, codeToVerify);
      showAlert('Conta verificada! Você já pode fazer login.', { title: 'Sucesso' });
      router.replace('/LoginScreen');
    } catch (e) {
      showAlert(getErrorMessage(e, 'Código inválido. Tente novamente.'), { title: 'Erro' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = (text: string) => {
    setCode(text);
    if (text.length === 6) {
      Keyboard.dismiss();
      setTimeout(() => handleVerify(text), 150);
    }
  };

  return { email: emailStr, code, loading, handleVerify, handleChangeCode };
}
