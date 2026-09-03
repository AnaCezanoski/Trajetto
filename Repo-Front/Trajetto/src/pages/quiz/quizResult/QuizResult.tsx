import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/src/theme';
import { useQuizResult } from './hooks/useQuizResult';
import { styles } from './styles/styles';

export default function QuizResult() {
  const s = styles(useColors());
  const { perfil, fromProfile, goBack } = useQuizResult();

  if (!perfil) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={s.errorText}>Resultado não encontrado.</Text>
        <TouchableOpacity onPress={goBack} style={s.backButton}>
          <Text style={s.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>

        <View style={s.hero}>
          <Text style={s.trophy}>🏆</Text>
          <Text style={s.heroLabel}>Seu resultado</Text>
          <Text style={s.emoji}>{perfil.emoji}</Text>
          <Text style={s.profileName}>{perfil.nome.toUpperCase()}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Sobre você</Text>
          <Text style={s.descricao}>{perfil.descricao}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Destinos que combinam com você</Text>
          {perfil.destinos_sugeridos.map((destino) => (
            <View key={destino} style={s.destinoRow}>
              <View style={s.destinoDot} />
              <Text style={s.destinoText}>{destino}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.backButton} onPress={goBack}>
          <Text style={s.backButtonText}>
            {fromProfile ? 'Voltar ao perfil' : 'Começar a explorar'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
