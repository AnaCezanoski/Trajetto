// ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { api } from '../services/api';
import { useRouter } from 'expo-router';
import { validateEmail } from '../utils/validators';

const PRIMARY = '#023665';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  const handleSend = async () => {
    const error = validateEmail(email);
    if (error) { setErrors({ email: error }); return; }
    setErrors({});
    try {
      setLoading(true);
      await api.post('/user/password/forgot', { email: email.trim().toLowerCase() });
      Alert.alert('Código enviado!', 'Verifique seu e-mail e insira o código na próxima tela.', [
        { text: 'OK', onPress: () => router.push({ pathname: '/ResetPasswordScreen', params: { email: email.trim().toLowerCase() } }) }
      ]);
    } catch (error: any) {
      console.log('ERROR FORGOT:', error?.response?.data);
      Alert.alert('Erro', 'Não foi possível enviar o código. Verifique se o e-mail está cadastrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Esqueceu sua senha?</Text>
          <Text style={styles.cardSub}>Insira seu e-mail e enviaremos um código de verificação.</Text>

          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            style={inputStyle('email')}
            placeholder="seu@email.com"
            value={email}
            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Enviando...' : 'Enviar código'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.registerLink}>Voltar ao Login</Text>
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
  input: { backgroundColor: '#f8f9fb', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 18, fontSize: 15, color: '#1a1a1a' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  loginBtn: { backgroundColor: PRIMARY, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerLink: { fontSize: 14, color: PRIMARY, fontWeight: '700' },
});