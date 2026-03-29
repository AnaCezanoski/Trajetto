import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.firstName} 👋</Text>
          <Text style={styles.subtitle}>Pronto para explorar?</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Card principal */}
      <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>✈️ Teste de Perfil</Text>
          <Text style={styles.heroText}>
            Descubra seu perfil de viajante e gere roteiros personalizados.
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Começar agora</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>🗺️ Gerar Roteiro</Text>
        <Text style={styles.heroText}>
          Descubra destinos personalizados com base no seu perfil de viajante.
        </Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Realizar teste</Text>
        </TouchableOpacity>
      </View>

      {/* Card lista de usuários — só mostra se for admin */}
      {user?.isAdmin && (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>👩‍👦 Lista de Usuários</Text>
          <Text style={styles.heroText}>
            Gerencie usuários cadastrados no Trajetto.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/UserListScreen')}> {/* ✅ corrigido */}
            <Text style={styles.heroButtonText}>Ver</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ações rápidas */}
      <Text style={styles.sectionTitle}>Acesso rápido</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}
          onPress={() => router.push('/(tabs)/mapa')}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionLabel}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}
          onPress={() => router.push('/ProfileScreen')}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24, paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  logout: { color: '#EF4444', fontWeight: 'bold' },
  heroCard: {
    backgroundColor: '#4F46E5', borderRadius: 16,
    padding: 24, marginBottom: 32,
  },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroText: { fontSize: 14, color: '#c7d2fe', marginBottom: 20, lineHeight: 20 },
  heroButton: {
    backgroundColor: '#fff', borderRadius: 8,
    padding: 12, alignItems: 'center',
  },
  heroButtonText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 20, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#444' },
});