// Regra que decide qual estado a tela mostra: carregando, erro, vazio ou conteúdo.
//
// Fica separada da aparência de propósito. É a única parte do padrão que carrega regra de
// negócio, não depende de React nem de tela nenhuma, e por isso pode ser testada sozinha
// (npm run test:feedback).

export type FeedbackStatus = 'loading' | 'error' | 'empty' | 'content';

/** O que se sabe sobre uma busca de dados em um dado momento. */
export interface RequestState<T> {
  /** Uma busca está em andamento. */
  loading: boolean;
  /** A falha que aconteceu, ou null quando não houve. */
  error: unknown;
  /** O que voltou da última busca bem-sucedida, ou null se nunca voltou nada. */
  data: T | null;
}

/**
 * Vazio é "veio resposta, mas não veio conteúdo": nada, lista sem itens ou
 * objeto sem nenhuma chave. Zero, texto vazio e false são conteúdo, não vazio.
 */
export const isEmpty = (data: unknown): boolean => {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data as object).length === 0;
  return false;
};

/**
 * Traduz o estado de uma busca no estado que a tela deve mostrar.
 *
 * A ordem importa e é sempre esta:
 *   1. carregando — só na primeira carga, quando ainda não há nada na tela;
 *   2. erro       — falhou, e a tela precisa oferecer uma saída ao usuário;
 *   3. vazio      — deu certo, mas não veio conteúdo;
 *   4. conteúdo   — o caminho normal.
 *
 * Recarregar com dados já na tela não volta para "carregando": o usuário continua vendo o
 * que já tinha, e quem cuida do aviso de atualização é o próprio "puxar para atualizar".
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
