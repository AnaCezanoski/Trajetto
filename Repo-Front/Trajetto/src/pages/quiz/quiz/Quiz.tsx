import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/src/theme';
import { useQuiz } from './hooks/useQuiz';
import { styles } from './styles/styles';

export default function Quiz() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = styles(colors);
  const { current, currentIndex, total, progress, selected, setSelected, handleNext, goBack } = useQuiz();

  if (!current) return null;

  return (
    <View style={s.container}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={goBack} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>Teste de Viajante</Text>
          </View>
        </View>
      </View>

      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.question}>{current.texto}</Text>

        {current.tipo === 'sim_nao' && (
          <View>
            <View style={s.simNaoRow}>
              {(['sim', 'nao'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[s.simNaoButton, selected === opt && s.simNaoSelected]}
                  onPress={() => setSelected(opt)}
                >
                  <Text style={[s.simNaoText, selected === opt && s.simNaoTextSelected]}>
                    {opt === 'sim' ? 'Sim' : 'Não'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[s.naoSeiButton, selected === 'nao_sei' && s.simNaoSelected]}
              onPress={() => setSelected('nao_sei')}
            >
              <Text style={[s.naoSeiText, selected === 'nao_sei' && s.simNaoTextSelected]}>
                Não sei dizer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {current.tipo === 'multipla_escolha' && current.opcoes?.map((opcao) => {
          const isSelected = selected === opcao.letra;
          return (
            <TouchableOpacity
              key={opcao.letra}
              style={[s.option, isSelected && s.optionSelected]}
              onPress={() => setSelected(opcao.letra)}
            >
              <View style={[s.radioOuter, isSelected && s.radioOuterSelected]}>
                {isSelected && <View style={s.radioInner} />}
              </View>
              <Text style={[s.optionText, isSelected && s.optionTextSelected]}>
                {opcao.texto}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextButton, !selected && s.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={s.nextButtonText}>
            {currentIndex === total - 1 ? 'Ver resultado' : 'Próxima pergunta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
