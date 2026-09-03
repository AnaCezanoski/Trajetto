import { Pergunta } from '@/data/quizData';

/**
 * Aplica a pontuacao da resposta selecionada aos scores acumulados do quiz.
 * Pergunta sim/nao pontua por `pontuacao[resposta]`; multipla escolha pontua
 * pela opcao cuja letra bate com `selected`. Retorna um novo objeto de scores
 * (nao muta o `scores` recebido).
 */
export function applyAnswerScore(
  question: Pergunta,
  selected: string,
  scores: Record<string, number>,
): Record<string, number> {
  const newScores = { ...scores };

  const pontuacaoPorPerfil = question.tipo === 'sim_nao'
    ? question.pontuacao?.[selected]
    : question.opcoes?.find((op) => op.letra === selected)?.pontuacao;

  if (pontuacaoPorPerfil) {
    Object.entries(pontuacaoPorPerfil).forEach(([perfil, valor]) => {
      newScores[perfil] = (newScores[perfil] || 0) + valor;
    });
  }

  return newScores;
}
