import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User } from '../types/user';

export default function UserListScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/user');
      console.log('FIRST USER:', JSON.stringify(res.data[0]));
      setUsers(res.data);
    } catch (error: any) {
      console.log('ERROR:', error.message);
      Alert.alert('Error', 'Unable to load users');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const deleteUser = (id: number) => {
    Alert.alert('Confirm', 'Confirm user deletion?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.delete(`/user/${id}`);
        fetchUsers();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
       <Text style={styles.title}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item, index) =>
          item.id !== undefined ? String(item.id) : String(index)
        }
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
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteUser(item.id)}>
                <Text style={styles.deleteBtn}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#B6A79A' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#023665' },
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