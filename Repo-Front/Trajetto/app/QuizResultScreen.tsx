import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { quizData } from '../data/quizData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizResultScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { profile, source } = useLocalSearchParams<{ profile: string; source?: string }>();
  const fromProfile = source === 'profile';

  const perfil = quizData.perfis[profile ?? ''];

  useEffect(() => {
    if (profile) {
      api.put('/user/me', { travelerProfile: profile })
        .then(() => refreshUser())
        .catch(() => {});
    }
  }, [profile]);

  if (!perfil) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Resultado não encontrado.</Text>
        <TouchableOpacity
          onPress={() => fromProfile ? router.replace('/(tabs)/perfil') : router.replace('/(tabs)')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.heroLabel}>Seu resultado</Text>
          <Text style={styles.emoji}>{perfil.emoji}</Text>
          <Text style={styles.profileName}>{perfil.nome.toUpperCase()}</Text>
        </View>

        {/* Descrição */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre você</Text>
          <Text style={styles.descricao}>{perfil.descricao}</Text>
        </View>

        {/* Destinos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Destinos que combinam com você</Text>
          {perfil.destinos_sugeridos.map((destino) => (
            <View key={destino} style={styles.destinoRow}>
              <View style={styles.destinoDot} />
              <Text style={styles.destinoText}>{destino}</Text>
            </View>
          ))}
        </View>

        {/* Botão voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            fromProfile
              ? router.replace('/perfil')
              : router.replace('/(tabs)')
          }
        >
          <Text style={styles.backButtonText}>
            {fromProfile ? 'Voltar ao perfil' : 'Começar a explorar'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#023665';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24, paddingBottom: 40 },

  hero: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  trophy: { fontSize: 32, marginBottom: 4 },
  heroLabel: { fontSize: 14, color: '#c7d2fe', marginBottom: 16 },
  emoji: { fontSize: 64, marginBottom: 12 },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 12,
  },
  descricao: { fontSize: 15, color: '#444', lineHeight: 24 },

  destinoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  destinoDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY,
  },
  destinoText: { fontSize: 15, color: '#333' },

  backButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  errorText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
});
