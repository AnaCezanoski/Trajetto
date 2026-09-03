import React from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { useTravelerTest } from './hooks/useTravelerTest';
import { styles } from './styles/styles';

export default function TravelerTest() {
  const colors = useColors();
  const s = styles(colors);
  const { fromProfile, skipping, handleSkip, goToQuiz } = useTravelerTest();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.icon}>✈️</Text>
        <Text style={s.title}>Descubra seu perfil</Text>
        <Text style={s.subtitle}>
          Responda algumas perguntas rápidas e descubra que tipo de viajante você é.
        </Text>

        {fromProfile && (
          <View style={s.retakeBadge}>
            <Ionicons name="sync" size={16} color={colors.white} />
            <Text style={s.retakeBadgeText}>Refazendo o teste</Text>
          </View>
        )}

        <View style={s.dots}>
          <View style={[s.dot, s.dotActive]} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
      </View>

      <View style={s.buttons}>
        <TouchableOpacity style={s.primaryButton} onPress={goToQuiz}>
          <Text style={s.primaryButtonText}>Fazer o teste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryButton}
          onPress={handleSkip}
          disabled={skipping}
          activeOpacity={0.75}
        >
          {skipping ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={s.secondaryButtonText}>
              {fromProfile ? 'Cancelar' : 'Deixar para depois'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
