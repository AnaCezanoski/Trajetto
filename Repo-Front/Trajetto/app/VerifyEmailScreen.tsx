import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../services/api';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    Keyboard.dismiss();
    if (code.length < 6) {
      Alert.alert('Atenção', 'Digite os 6 dígitos do código.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/user/verify?email=${email}&code=${code}`);
      Alert.alert('Sucesso', 'Conta verificada! Você já pode fazer login.');
      router.replace('/LoginScreen');
    } catch {
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = (text: string) => {
    setCode(text);
    if (text.length === 6) {
      Keyboard.dismiss();
      // pequeno delay para o teclado fechar antes de chamar a API
      setTimeout(handleVerify, 150);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Verifique seu Email</Text>
          <Text style={styles.subtitle}>Enviamos um código de 6 dígitos para{'\n'}{email}</Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={handleChangeCode}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Confirmar</Text>
            }
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#023665', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 36, textAlign: 'center', lineHeight: 22 },
  input: {
    borderWidth: 2, borderColor: '#023665', borderRadius: 14,
    padding: 18, fontSize: 28, marginBottom: 28,
    textAlign: 'center', letterSpacing: 12, fontWeight: '700', color: '#023665',
  },
  button: { backgroundColor: '#023665', padding: 16, borderRadius: 12, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});