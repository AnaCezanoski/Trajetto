import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { quizData, shuffle, calcularPerfil, Pergunta } from '../data/quizData';

const INITIAL_SCORES: Record<string, number> = {
  AVENTUREIRO: 0, CULTURAL: 0, NATUREZA: 0, LUXO: 0,
  MOCHILEIRO: 0, RELAXAMENTO: 0, SOCIAL: 0, SOLITARIO: 0,
};

export default function QuizScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Pergunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({ ...INITIAL_SCORES });

  useEffect(() => {
    setQuestions(shuffle([...quizData.perguntas]).slice(0, 10));
  }, []);

  if (questions.length === 0) return null;

  const current = questions[currentIndex];
  const total = questions.length;
  const progress = (currentIndex + 1) / total;

  const handleNext = () => {
    if (!selected) return;

    const newScores = { ...scores };

    if (current.tipo === 'sim_nao') {
      const pontos = current.pontuacao?.[selected];
      if (pontos) {
        Object.entries(pontos).forEach(([perfil, valor]) => {
          newScores[perfil] = (newScores[perfil] || 0) + valor;
        });
      }
    } else {
      const opcao = current.opcoes?.find(op => op.letra === selected);
      if (opcao) {
        Object.entries(opcao.pontuacao).forEach(([perfil, valor]) => {
          newScores[perfil] = (newScores[perfil] || 0) + valor;
        });
      }
    }

    if (currentIndex === total - 1) {
      const perfil = calcularPerfil(newScores);
      router.replace(`/QuizResultScreen?profile=${perfil}`);
    } else {
      setScores(newScores);
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>{current.texto}</Text>

        {/* Sim / Não / Não sei dizer */}
        {current.tipo === 'sim_nao' && (
          <View>
            <View style={styles.simNaoRow}>
              {(['sim', 'nao'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.simNaoButton, selected === opt && styles.simNaoSelected]}
                  onPress={() => setSelected(opt)}
                >
                  <Text style={[styles.simNaoText, selected === opt && styles.simNaoTextSelected]}>
                    {opt === 'sim' ? 'Sim' : 'Não'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.naoSeiButton, selected === 'nao_sei' && styles.simNaoSelected]}
              onPress={() => setSelected('nao_sei')}
            >
              <Text style={[styles.naoSeiText, selected === 'nao_sei' && styles.simNaoTextSelected]}>
                Não sei dizer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Múltipla escolha */}
        {current.tipo === 'multipla_escolha' && current.opcoes?.map((opcao) => {
          const isSelected = selected === opcao.letra;
          return (
            <TouchableOpacity
              key={opcao.letra}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(opcao.letra)}
            >
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {opcao.texto}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === total - 1 ? 'Ver resultado' : 'Próxima pergunta'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = '#023665';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: { padding: 4 },
  backText: { fontSize: 24, color: PRIMARY },
  counter: { fontSize: 15, fontWeight: '600', color: '#666' },

  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: PRIMARY,
    borderRadius: 3,
  },

  content: { padding: 24, paddingBottom: 16 },

  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 30,
    marginBottom: 32,
  },

  simNaoRow: { flexDirection: 'row', gap: 16 },
  simNaoButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  simNaoSelected: { borderColor: PRIMARY, backgroundColor: '#eef2ff' },
  simNaoText: { fontSize: 17, fontWeight: '600', color: '#555' },
  simNaoTextSelected: { color: PRIMARY },
  naoSeiButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  naoSeiText: { fontSize: 15, fontWeight: '500', color: '#9ca3af' },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    gap: 14,
  },
  optionSelected: { borderColor: PRIMARY, backgroundColor: '#eef2ff' },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: PRIMARY },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRIMARY,
  },
  optionText: { flex: 1, fontSize: 15, color: '#333', lineHeight: 22 },
  optionTextSelected: { color: PRIMARY, fontWeight: '600' },

  footer: { padding: 24, paddingTop: 8 },
  nextButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#93adc8' },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
