// Tela de apoio para conferir os estados de carregamento, erro e vazio sem depender do
// backend. Usa o mesmo hook e o mesmo AsyncBoundary das telas de verdade.
//
// Abrir em: /DemoFeedbackScreen

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AsyncBoundary, useAsyncData } from '../components/feedback';

const PRIMARY = '#023665';

type Cenario = 'carregando' | 'erro' | 'vazio' | 'conteudo';

const ROTULOS: { chave: Cenario; rotulo: string }[] = [
  { chave: 'carregando', rotulo: 'Carregando' },
  { chave: 'erro',       rotulo: 'Erro' },
  { chave: 'vazio',      rotulo: 'Vazio' },
  { chave: 'conteudo',   rotulo: 'Conteúdo' },
];

const BUSCAS: Record<Cenario, () => Promise<string[]>> = {
  carregando: () => new Promise<string[]>(() => {}),
  erro:       () => Promise.reject(new Error('falha simulada')),
  vazio:      () => Promise.resolve([]),
  conteudo:   () => Promise.resolve(['Curitiba', 'Foz do Iguaçu', 'Morretes']),
};

export default function DemoFeedbackScreen() {
  const [cenario, setCenario] = useState<Cenario>('carregando');
  const destinos = useAsyncData(() => BUSCAS[cenario](), [cenario]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estados da tela</Text>
        <View style={styles.abas}>
          {ROTULOS.map(({ chave, rotulo }) => (
            <TouchableOpacity
              key={chave}
              style={[styles.aba, cenario === chave && styles.abaAtiva]}
              onPress={() => setCenario(chave)}
              activeOpacity={0.85}
            >
              <Text style={[styles.abaTexto, cenario === chave && styles.abaTextoAtivo]}>{rotulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.palco}>
        <AsyncBoundary
          state={destinos}
          onRetry={destinos.reload}
          loading={{ title: 'Carregando destinos...' }}
          error={{ title: 'Não foi possível carregar os destinos' }}
          empty={{
            icon: '🗺️',
            title: 'Nenhum destino por aqui',
            message: 'Quando houver destinos cadastrados, eles aparecem nesta lista.',
          }}
        >
          {(lista) => (
            <ScrollView contentContainerStyle={styles.lista}>
              {lista.map((destino) => (
                <View key={destino} style={styles.card}>
                  <Text style={styles.cardTexto}>{destino}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </AsyncBoundary>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PRIMARY },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 14 },

  abas: { flexDirection: 'row', gap: 8 },
  aba: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  abaAtiva: { backgroundColor: '#fff', borderColor: '#fff' },
  abaTexto: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  abaTextoAtivo: { color: PRIMARY },

  palco: { flex: 1, backgroundColor: '#f4f6f9' },
  lista: { padding: 20, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTexto: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
});
