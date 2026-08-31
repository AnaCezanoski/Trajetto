// Guarda o estado de uma busca: carregando, o que voltou e a falha, se houver. A busca em
// si continua na camada de serviços — este hook não sabe o que é HTTP.

import { useCallback, useEffect, useRef, useState } from 'react';
import { RequestState } from './feedbackStatus';

export interface AsyncData<T> extends RequestState<T> {
  /** Refaz a busca. É o "tentar novamente" oferecido quando algo falha. */
  reload: () => Promise<void>;
  /** Recarga com dados já na tela — serve para o "puxar para atualizar". */
  refreshing: boolean;
}

export interface AsyncDataOptions {
  /** Buscar sozinho ao montar. Desligue quando outra coisa manda na hora da busca. */
  auto?: boolean;
}

/**
 * @param loader  o que buscar, normalmente uma chamada da camada de serviços.
 * @param deps    quando refazer a busca sozinho (mesma ideia do useEffect).
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
  { auto = true }: AsyncDataOptions = {},
): AsyncData<T> {
  const [state, setState] = useState<RequestState<T>>({ loading: true, error: null, data: null });
  const [refreshing, setRefreshing] = useState(false);

  // Evita mexer no estado de uma tela já abandonada e descartar resposta antiga que chegou
  // depois de uma mais nova. jaTemDados diz se a recarga é a primeira ou uma atualização.
  const ativo = useRef(true);
  const buscaAtual = useRef(0);
  const jaTemDados = useRef(false);
  jaTemDados.current = state.data !== null;

  useEffect(() => {
    ativo.current = true;
    return () => { ativo.current = false; };
  }, []);

  const reload = useCallback(async () => {
    const busca = ++buscaAtual.current;

    if (jaTemDados.current) setRefreshing(true);
    setState((anterior) => ({ ...anterior, loading: true, error: null }));

    try {
      const data = await loader();
      if (!ativo.current || busca !== buscaAtual.current) return;
      setState({ loading: false, error: null, data });
    } catch (error) {
      if (!ativo.current || busca !== buscaAtual.current) return;
      setState((anterior) => ({ loading: false, error, data: anterior.data }));
    } finally {
      if (ativo.current && busca === buscaAtual.current) setRefreshing(false);
    }
    // O loader é recriado a cada render; quem manda em refazer a busca é o deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { if (auto) reload(); }, [auto, reload]);

  return { ...state, refreshing, reload };
}
