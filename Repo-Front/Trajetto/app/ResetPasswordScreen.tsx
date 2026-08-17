// ResetPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { api } from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { validateEmail, validatePassword, passwordStrength } from '../utils/validators';
import { getErrorMessage } from '../utils/apiError';
import Svg, { Path } from 'react-native-svg';
import CustomInput from '../components/CustomInput';

const PRIMARY = '#023665';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false); // Keep loading state

  const strength = passwordStrength(password);

  const handleReset = async () => {
    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    if (!code) newErrors.code = 'O código é obrigatório.';
    else if (!/^\d{6}$/.test(code)) newErrors.code = 'O código deve ter exatamente 6 dígitos.';
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    try {
      setLoading(true);
      await api.post('/user/password/reset', { email: email.trim().toLowerCase(), code, newPassword: password });
      Alert.alert('Sucesso', 'Senha redefinida!', [{ text: 'OK', onPress: () => router.replace('/LoginScreen') }]);
    } catch (error) {
      // Ex.: "Este código expirou. Solicite um novo." / "Código de redefinição inválido."
      Alert.alert('Erro', getErrorMessage(error, 'Código inválido ou expirado'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Redefinir senha</Text>
          <Text style={styles.cardSub}>Digite o código enviado para o seu e-mail e escolha uma nova senha.</Text>

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
            placeholder="seu@email.com"
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label="Código de Verificação"
            type="numeric"
            value={code}
            onChangeText={(t) => { setCode(t.replace(/\D/g, '')); if (errors.code) setErrors(prev => ({ ...prev, code: '' })); }}
            placeholder="000000"
            maxLength={6}
            error={errors.code}
          />

          <CustomInput
            label="Nova Senha"
            type="password"
            value={password}
            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
              placeholder="••••••••"
            error={errors.password}
          />

          {password.length > 0 && (
            <View style={styles.passwordStrength}>
              <View style={[styles.strengthBar, strength.length ? styles.strengthOk : styles.strengthWeak]}/>
              <View style={[styles.strengthBar, strength.uppercase && strength.lowercase ? styles.strengthOk : styles.strengthWeak]}/>
              <View style={[styles.strengthBar, strength.number ? styles.strengthOk : styles.strengthWeak]}/>
              <View style={[styles.strengthBar, strength.special ? styles.strengthOk : styles.strengthWeak]}/>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleReset} // Corrected to handleReset
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Redefinindo...' : 'Redefinir senha'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.registerLink}>Voltar</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f4f6f9', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#8a9ab0', marginBottom: 24, lineHeight: 20 },
  passwordStrength: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthOk: { backgroundColor: '#22c55e' },
  strengthWeak: { backgroundColor: '#ddd' },
  loginBtn: { backgroundColor: PRIMARY, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerLink: { fontSize: 14, color: PRIMARY, fontWeight: '700' },
});