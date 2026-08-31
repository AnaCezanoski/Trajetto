// Porta de entrada do padrão de feedback: as telas importam daqui e não precisam conhecer
// como o estado é guardado nem como o aviso é desenhado.

export { AsyncBoundary } from './AsyncBoundary';
export type { AsyncBoundaryProps } from './AsyncBoundary';

export { FeedbackState } from './FeedbackState';
export type { FeedbackCopy, FeedbackStateProps, FeedbackVariant } from './FeedbackState';

export { useAsyncData } from './useAsyncData';
export type { AsyncData, AsyncDataOptions } from './useAsyncData';

export { isEmpty, resolveFeedbackStatus } from './feedbackStatus';
export type { FeedbackStatus, RequestState } from './feedbackStatus';
