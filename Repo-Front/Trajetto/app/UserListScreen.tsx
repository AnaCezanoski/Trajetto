import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function UserListScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/user');
      setUsers(res.data);
    } catch (error: any) {
      console.log('ERRO:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    }
  };

  // Recarrega a lista toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const deleteUser = (id: number) => {
    Alert.alert('Confirmar', 'Confirmar exclusão de usuário?', [
      { text: 'Cancelar' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await api.delete(`/user/${id}`);
        fetchUsers();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.code)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.meta}>{item.country} · {item.telephone}</Text>
              <Text style={styles.role}>{item.isAdmin ? 'ADMIN' : 'USER'}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => router.push({
                pathname: '/UserDetailScreen',
                params: { user: JSON.stringify(item) }
              })}>
                <Text style={styles.editBtn}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteUser(item.code)}>
                <Text style={styles.deleteBtn}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  logoutBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  logoutText: { color: '#EF4444', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 'bold', fontSize: 16 },
  email: { color: '#666', fontSize: 13 },
  meta: { color: '#999', fontSize: 12 },
  role: { color: '#023665', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12 },
  editBtn: { color: '#023665', fontWeight: 'bold' },
  deleteBtn: { color: '#EF4444', fontWeight: 'bold' },
});