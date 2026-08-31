// Liga o estado de uma busca à aparência dos avisos.
//
// A tela entrega o que sabe sobre a busca e o que desenhar quando há conteúdo; quem escolhe
// entre carregando, erro e vazio é este componente. Assim nenhuma tela repete a decisão nem
// o desenho do aviso — as duas coisas ficam em um lugar só.

import React, { ReactNode } from 'react';
import { getErrorMessage } from '../../utils/apiError';
import { FeedbackCopy, FeedbackState } from './FeedbackState';
import { RequestState, resolveFeedbackStatus } from './feedbackStatus';

export interface AsyncBoundaryProps<T> {
  /** O que se sabe sobre a busca — normalmente o retorno de useAsyncData. */
  state: RequestState<T>;
  /** Ação de recuperação oferecida no erro e no vazio. Sem ela, o aviso não mostra botão. */
  onRetry?: () => void;
  /** Palavras específicas desta tela. O que não for informado usa o texto padrão do app. */
  loading?: FeedbackCopy;
  error?: FeedbackCopy;
  empty?: FeedbackCopy;
  /** O que a tela considera vazio, quando "lista sem itens" não descreve o caso dela. */
  isEmpty?: (data: T | null) => boolean;
  /** O conteúdo, desenhado só quando existe conteúdo para desenhar. */
  children: (data: T) => ReactNode;
}

export function AsyncBoundary<T>({
  state, onRetry, loading, error, empty, isEmpty, children,
}: AsyncBoundaryProps<T>) {
  const status = resolveFeedbackStatus(state, isEmpty);

  if (status === 'loading') {
    return <FeedbackState variant="loading" {...loading} />;
  }

  if (status === 'error') {
    // A mensagem que o backend mandou explica a falha melhor do que qualquer texto genérico
    // (e o contrato de erro já cuida de traduzir "sem rede" e afins). O texto da tela entra
    // só quando ela quis dizer algo específico.
    const { message: mensagemDaTela, ...restoDoErro } = error ?? {};

    return (
      <FeedbackState
        variant="error"
        message={mensagemDaTela ?? getErrorMessage(state.error)}
        onAction={onRetry}
        {...restoDoErro}
      />
    );
  }

  if (status === 'empty') {
    return <FeedbackState variant="empty" onAction={onRetry} {...empty} />;
  }

  return <>{children(state.data as T)}</>;
}

export default AsyncBoundary;
