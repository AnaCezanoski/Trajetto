// Vitrine do padrão de feedback: mostra os três estados lado a lado, sem depender do backend.
//
// Serve para conferir e demonstrar o padrão em segundos. Não usa cópia nem imitação dos
// componentes: é o mesmo hook e o mesmo AsyncBoundary que as telas de verdade usam, então o
// que aparece aqui é exatamente o que o usuário vê no app.
//
// Como abrir: npm run web e acesse /DemoFeedbackScreen

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AsyncBoundary, useAsyncData } from '../components/feedback';

const PRIMARY = '#023665';

type Cenario = 'carregando' | 'erro' | 'vazio' | 'conteudo';

const CENARIOS: { chave: Cenario; rotulo: string; explicacao: string }[] = [
  { chave: 'carregando', rotulo: 'Carregando', explicacao: 'A busca começou e ainda não respondeu.' },
  { chave: 'erro',       rotulo: 'Erro',       explicacao: 'A busca falhou. O aviso explica e oferece uma saída.' },
  { chave: 'vazio',      rotulo: 'Vazio',      explicacao: 'A busca deu certo, mas não veio nada para mostrar.' },
  { chave: 'conteudo',   rotulo: 'Conteúdo',   explicacao: 'O caminho normal: o aviso some e a tela aparece.' },
];

// Cada cenário é só uma promessa que se comporta de um jeito. Nada de rede envolvido.
const BUSCAS: Record<Cenario, () => Promise<string[]>> = {
  carregando: () => new Promise<string[]>(() => {}),
  erro:       () => Promise.reject(new Error('falha simulada')),
  vazio:      () => Promise.resolve([]),
  conteudo:   () => Promise.resolve(['Curitiba', 'Foz do Iguaçu', 'Morretes']),
};

export default function DemoFeedbackScreen() {
  const [cenario, setCenario] = useState<Cenario>('carregando');
  const destinos = useAsyncData(() => BUSCAS[cenario](), [cenario]);

  const atual = CENARIOS.find((c) => c.chave === cenario)!;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Padrão de feedback</Text>
        <Text style={styles.headerSub}>Toque em um estado para ver como o app responde</Text>
      </View>

      <View style={styles.abas}>
        {CENARIOS.map(({ chave, rotulo }) => (
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

      <Text style={styles.explicacao}>{atual.explicacao}</Text>

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

  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  abas: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
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

  explicacao: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 20,
    paddingBottom: 14,
    textAlign: 'center',
  },

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
