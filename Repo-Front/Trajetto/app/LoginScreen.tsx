import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
//import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { api } from '../services/api';


export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) return Alert.alert('Preencha todos os campos');
//     try {
//       setLoading(true);
//       await login({ email, password });
//       // Navegação automática via AuthContext
//     } catch {
//       Alert.alert('Erro', 'Email ou senha inválidos');
//     } finally {
//       setLoading(false);
//     }
//   };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Preencha todos os campos');
    try {
      setLoading(true);
      console.log('Tentando logar com:', email, password);
      console.log('URL base:', api.defaults.baseURL);
      await login({ email, password });
    } catch (error: any) {
      console.log('ERRO COMPLETO:', JSON.stringify(error));
      console.log('RESPONSE:', JSON.stringify(error.response?.data));
      console.log('STATUS:', error.response?.status);
      console.log('MESSAGE:', error.message);
      Alert.alert('Erro', 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trajetto</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={password}
        onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/RegisterScreen')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: '#023665' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#023665' },
});