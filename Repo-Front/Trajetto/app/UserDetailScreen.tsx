import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../services/api';

export default function UserDetailScreen() {
  const { user: userParam } = useLocalSearchParams();
  const user = JSON.parse(userParam as string);
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [country, setCountry] = useState(user.country);
  const [telephone, setTelephone] = useState(user.telephone);
  const [isAdmin, setIsAdmin] = useState<boolean>(user.isAdmin);
  const [loading, setLoading] = useState(false);


  const handleUpdate = async () => {
      try {
        setLoading(true);
        const response = await api.patch(`/user/${user.id}`, { firstName, lastName, email, birthDate, country, telephone });
        console.log('RESPOSTA:', JSON.stringify(response.data));
        Alert.alert('Sucesso', 'Perfil atualizado!');
        router.back();
        fetchUsers();
      } catch (error: any) {
        console.log('ERRO UPDATE:', JSON.stringify(error.response?.data));
        console.log('STATUS:', error.response?.status);
        console.log('BODY ENVIADO:', JSON.stringify({ firstName, lastName, email, birthDate, country, telephone }));
        Alert.alert('Erro', 'Não foi possível atualizar');
      } finally {
        setLoading(false);
      }
    };

  const handleRoleChange = async (newIsAdmin: boolean) => {
    try {
      await api.put(`/user/${user.id}/role`, { isAdmin: newIsAdmin });
      setIsAdmin(newIsAdmin);
      Alert.alert('Sucesso', `Role alterada para ${newIsAdmin ? 'ADMIN' : 'USER'}`);
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar a role');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Usuário</Text>
      <TextInput style={styles.input} placeholder="Nome" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Sobrenome" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Data de nascimento (AAAA-MM-DD)"
        value={birthDate} onChangeText={setBirthDate} />
      <TextInput style={styles.input} placeholder="País" value={country} onChangeText={setCountry} />
      <TextInput style={styles.input} placeholder="Telefone" value={telephone}
        onChangeText={setTelephone} keyboardType="phone-pad" />

      <Text style={styles.label}>
        Role atual: <Text style={styles.roleText}>{isAdmin ? 'ADMIN' : 'USER'}</Text>
      </Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, !isAdmin && styles.roleBtnActive]}
          onPress={() => handleRoleChange(false)}>
          <Text style={[styles.roleBtnText, !isAdmin && styles.roleBtnTextActive]}>USER</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, isAdmin && styles.roleBtnActive]}
          onPress={() => handleRoleChange(true)}>
          <Text style={[styles.roleBtnText, isAdmin && styles.roleBtnTextActive]}>ADMIN</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#023665' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  label: { fontSize: 14, color: '#444', marginBottom: 8 },
  roleText: { color: '#023665', fontWeight: 'bold' },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#023665', borderColor: '#023665' },
  roleBtnText: { fontWeight: 'bold', color: '#666' },
  roleBtnTextActive: { color: '#fff' },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});