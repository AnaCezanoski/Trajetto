// ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { api } from '../services/api';
import { useRouter } from 'expo-router';
import { validateEmail } from '../utils/validators';
import CustomInput from '../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../assets/appImgs/logo.svg';

const PRIMARY = '#006ecf';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: PRIMARY }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={'white'} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Esqueci a Senha</Text>
          </View>

          <View style={styles.headerCenter} pointerEvents="none">
            <View style={{
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 5,
            }}>
              <Logo width={20} height={20} color={PRIMARY} />
            </View>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Esqueceu sua senha?</Text>
            
          </View>

          <View style={{    marginTop: 60,}}>
            <Text style={styles.cardSub}>Insira seu e-mail e enviaremos um código de verificação.</Text>
            <CustomInput
              label="E-mail"
              type="email"
              value={email}
              onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
              placeholder="seu@email.com"
              autoCapitalize="none"
              error={errors.email}
            />
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 32,
    gap: 20,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#1a1a1a', marginBottom: 24, lineHeight: 20 },
  loginBtn: { backgroundColor: PRIMARY, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 100 },
  registerLink: { fontSize: 14, color: PRIMARY, fontWeight: '700' },
  headerWrapper: { paddingHorizontal: 24, backgroundColor: PRIMARY },
  content: { paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerBackBtn: { padding: 8, marginLeft: -12 },
  headerText: { fontSize: 10, fontWeight: '700', color: 'white', marginLeft: -4 },
  headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
});