import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import { useUserList } from './hooks/useUserList';
import UserCard from './components/UserCard/UserCard';
import { styles } from './styles/styles';

export default function UserList() {
  const colors = useColors();
  const s = styles(colors);
  const { admin, users, loading, logout, editUser, deleteUser } = useUserList();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Painel Admin</Text>
          <Text style={s.headerSub}>Olá, {admin?.firstName} 🛡️</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={s.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <AsyncState style={s.center} loading={loading} loadingText="Carregando usuários..." spinnerColor={colors.primaryDark}>
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.id != null ? String(item.id) : String(index)}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            <Text style={s.sectionLabel}>USUÁRIOS ({users.length})</Text>
          }
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onEdit={() => editUser(item)}
              onDelete={() => deleteUser(item.id, item.firstName)}
            />
          )}
        />
      </AsyncState>
    </SafeAreaView>
  );
}
