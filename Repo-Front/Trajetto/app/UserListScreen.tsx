import React, { useCallback } from 'react';
import {
  SafeAreaView, View, Text, FlatList,
  TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { userService } from '../services';
import { AsyncBoundary, useAsyncData } from '../components/feedback';
import { getErrorMessage } from '../utils/apiError';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY = '#023665';

export default function UserListScreen() {
  const { user: admin, logout } = useAuth();
  const router = useRouter();

  // A tela diz só o que buscar. Carregando, erro e vazio são cuidados pelo padrão de feedback.
  const usuarios = useAsyncData(() => userService.getAll(), [], { auto: false });
  const { reload: recarregar } = usuarios;

  // Recarrega toda vez que a tela volta ao foco: voltar da edição precisa mostrar o dado novo.
  useFocusEffect(useCallback(() => { recarregar(); }, [recarregar]));

  const deleteUser = (id: number, name: string) => {
    Alert.alert('Excluir usuário', `Deseja excluir ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await userService.remove(id);
            usuarios.reload();
          } catch (e) {
            // Ex.: "Um administrador não pode remover a si mesmo."
            Alert.alert('Erro', getErrorMessage(e, 'Não foi possível excluir o usuário.'));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Text style={styles.headerSub}>Olá, {admin?.firstName} 🛡️</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <AsyncBoundary
        state={usuarios}
        onRetry={usuarios.reload}
        loading={{ title: 'Carregando usuários...' }}
        error={{ title: 'Não foi possível carregar os usuários' }}
        empty={{
          icon: '👥',
          title: 'Nenhum usuário cadastrado',
          message: 'Assim que alguém criar uma conta, a pessoa aparece nesta lista.',
        }}
      >
        {(lista) => (
          <FlatList
            data={lista}
            keyExtractor={(item, index) => item.id != null ? String(item.id) : String(index)}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={usuarios.refreshing} onRefresh={usuarios.reload} tintColor={PRIMARY} />
            }
            ListHeaderComponent={
              <Text style={styles.sectionLabel}>USUÁRIOS ({lista.length})</Text>
            }
            renderItem={({ item }: { item: User }) => (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.cardEmail}>{item.email}</Text>
                    <Text style={styles.cardMeta}>{item.country}{item.telephone ? ` · ${item.telephone}` : ''}</Text>
                    <View style={[styles.roleBadge, item.isAdmin && styles.roleBadgeAdmin]}>
                      <Text style={[styles.roleBadgeText, item.isAdmin && styles.roleBadgeTextAdmin]}>
                        {item.isAdmin ? '🛡️ Admin' : '👤 Usuário'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: '/UserDetailScreen', params: { user: JSON.stringify(item) } })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteUser(item.id, item.firstName)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteBtnIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PRIMARY },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: PRIMARY,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  list: { padding: 20, paddingBottom: 32, backgroundColor: '#f4f6f9', flexGrow: 1 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#8a9ab0',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#eef2f7',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  cardEmail: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeAdmin: { backgroundColor: '#e8f0fe' },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  roleBadgeTextAdmin: { color: PRIMARY },

  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  deleteBtn: { padding: 6 },
  deleteBtnIcon: { fontSize: 18 },
});
