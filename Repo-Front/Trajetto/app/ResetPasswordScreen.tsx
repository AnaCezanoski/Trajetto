// ResetPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { api } from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { validateEmail, validatePassword, passwordStrength } from '../utils/validators';
import Svg, { Path } from 'react-native-svg';

const PRIMARY = '#023665';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

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
    } catch (error: any) {
      console.log('ERROR RESET:', error?.response?.data);
      Alert.alert('Erro', 'Código inválido ou expirado');
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

          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            style={inputStyle('email')}
            placeholder="seu@email.com"
            value={email}
            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.inputLabel}>Código de Verificação</Text>
          <TextInput
            style={inputStyle('code')}
            placeholder="000000"
            value={code}
            onChangeText={(t) => { setCode(t.replace(/\D/g, '')); if (errors.code) setErrors(prev => ({ ...prev, code: '' })); }}
            keyboardType="numeric"
            maxLength={6}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}

          <Text style={styles.inputLabel}>Nova Senha</Text>
          <View style={[styles.passwordWrapper, errors.password ? styles.inputError : null]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#aab"
              value={password}
              onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.7}>
              {showPassword ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#8a9ab0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#8a9ab0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              ) : (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.71 15.68M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke="#8a9ab0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M1 1L23 23" stroke="#8a9ab0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              )}
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

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
            onPress={handleReset}
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
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 6 },
  input: { backgroundColor: '#f8f9fb', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 4, fontSize: 15, color: '#1a1a1a' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fb', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, marginBottom: 4 },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1a1a1a' },
  eyeBtn: { padding: 4 },
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