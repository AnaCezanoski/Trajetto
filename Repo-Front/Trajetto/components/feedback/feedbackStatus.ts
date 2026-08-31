// Regra que decide qual estado a tela mostra. Sem React e sem visual, para poder ser
// testada sozinha (npm run test:feedback).

export type FeedbackStatus = 'loading' | 'error' | 'empty' | 'content';

/** O que se sabe sobre uma busca em um dado momento. */
export interface RequestState<T> {
  loading: boolean;
  error: unknown;
  data: T | null;
}

/** Vazio é "veio resposta, mas sem conteúdo". Zero, texto vazio e false são conteúdo. */
export const isEmpty = (data: unknown): boolean => {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data as object).length === 0;
  return false;
};

/**
 * Ordem das perguntas: carregando (só na primeira carga) → erro → vazio → conteúdo.
 * Recarregar com dados na tela não volta para "carregando": o usuário continua vendo o
 * que já tinha, e o aviso de atualização fica por conta do "puxar para atualizar".
 *
 * @param estaVazio permite que a tela diga o que considera vazio no caso dela.
 */
export const resolveFeedbackStatus = <T>(
  state: RequestState<T>,
  estaVazio: (data: T | null) => boolean = isEmpty,
): FeedbackStatus => {
  if (state.loading && state.data === null) return 'loading';
  if (state.error) return 'error';
  if (estaVazio(state.data)) return 'empty';
  return 'content';
};
