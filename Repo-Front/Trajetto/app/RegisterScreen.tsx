import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useRouter } from 'expo-router';

export default function RegisterScreen({ navigation }: any) {
    const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !birthDate || !country || !telephone) {
      return Alert.alert('Atenção', 'Preencha todos os campos');
    }
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password, birthDate, country, telephone });
      Alert.alert('Sucesso', 'Conta criada! Faça login.');
      router.push('LoginScreen'); // ← substituiu router.push()
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput style={styles.input} placeholder="Nome" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Sobrenome" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Telefone" value={telephone}
        onChangeText={setTelephone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Data de nascimento (AAAA-MM-DD)"
        value={birthDate} onChangeText={setBirthDate} />
      <TextInput style={styles.input} placeholder="País" value={country} onChangeText={setCountry} />
      <TextInput style={styles.input} placeholder="Senha" value={password}
        onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#023665' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});