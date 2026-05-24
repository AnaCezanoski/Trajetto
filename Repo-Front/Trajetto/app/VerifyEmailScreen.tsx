import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../services/api';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    try {
      await api.post(`/user/verify?email=${email}&code=${code}`);
      Alert.alert('Sucesso', 'Conta verificada! Você já pode fazer login.');
      router.replace('/LoginScreen');
    } catch (error) {
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>Verifique seu Email</Text>
      <Text style={styles.subtitle}>Enviamos um código de 6 dígitos para {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite o código"
        keyboardType="numeric"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#023665' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 18, marginBottom: 20, textAlign: 'center', letterSpacing: 5 },
  button: { backgroundColor: '#023665', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});