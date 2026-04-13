import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function TravelerTestScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const fromProfile = source === 'profile';

  const [skipping, setSkipping] = useState(false);

  const handleSkip = async () => {
    if (fromProfile) {
      // Veio do menu do perfil — só volta, sem alterar o status
      router.back();
      return;
    }
    // Primeiro login ou relogin com SKIPPED — salva/mantém SKIPPED
    try {
      setSkipping(true);
      await api.put('/user/me', { travelerProfile: 'SKIPPED' });
      await refreshUser();
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    } finally {
      setSkipping(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✈️</Text>
        <Text style={styles.title}>Descubra seu perfil</Text>
        <Text style={styles.subtitle}>
          Responda algumas perguntas rápidas e descubra que tipo de viajante você é.
        </Text>

        {fromProfile && (
          <View style={styles.retakeBadge}>
            <Text style={styles.retakeBadgeText}>🔄 Refazendo o teste</Text>
          </View>
        )}

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push(
              fromProfile
                ? '/QuizScreen?source=profile'
                : '/QuizScreen'
            )
          }
        >
          <Text style={styles.primaryButtonText}>Fazer o teste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          disabled={skipping}
          activeOpacity={0.75}
        >
          {skipping ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {fromProfile ? 'Cancelar' : 'Deixar para depois'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#023665' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: { fontSize: 72, marginBottom: 32 },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#c7d2fe',
    textAlign: 'center',
    lineHeight: 26,
  },
  retakeBadge: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  retakeBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: '#fff', width: 24 },
  buttons: { paddingHorizontal: 32, paddingBottom: 48, gap: 12 },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#023665', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#fff', fontSize: 16 },
});
