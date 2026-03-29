import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';


export default function ProfileScreen() {
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/user/me').then((res) => {
      const u = res.data;
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setEmail(u.email);
      setBirthDate(u.birthDate);
      setCountry(u.country);
      setTelephone(u.telephone);
    });
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await api.put('/user/me', { firstName, lastName, email, birthDate, country, telephone });
      console.log('RESPOSTA:', JSON.stringify(response.data));
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (error: any) {
      console.log('ERRO UPDATE:', JSON.stringify(error.response?.data));
      console.log('STATUS:', error.response?.status);
      console.log('BODY ENVIADO:', JSON.stringify({ firstName, lastName, email, birthDate, country, telephone }));
      Alert.alert('Erro', 'Não foi possível atualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <TextInput style={styles.input} placeholder="Nome" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Sobrenome" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Data de nascimento (AAAA-MM-DD)"
        value={birthDate} onChangeText={setBirthDate} />
      <TextInput style={styles.input} placeholder="País" value={country} onChangeText={setCountry} />
      <TextInput style={styles.input} placeholder="Telefone" value={telephone}
        onChangeText={setTelephone} keyboardType="phone-pad" />
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#023665' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: 'bold' },
});