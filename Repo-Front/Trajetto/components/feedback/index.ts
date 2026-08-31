// Porta de entrada do padrão de feedback.
//
// Telas importam daqui ('../components/feedback') e não precisam conhecer como o estado é
// guardado nem como o aviso é desenhado. Trocar o visual dos avisos ou a regra de quando
// cada um aparece é mexer só dentro desta pasta.

export { AsyncBoundary } from './AsyncBoundary';
export type { AsyncBoundaryProps } from './AsyncBoundary';

export { FeedbackState } from './FeedbackState';
export type { FeedbackCopy, FeedbackStateProps, FeedbackVariant } from './FeedbackState';

export { useAsyncData } from './useAsyncData';
export type { AsyncData, AsyncDataOptions } from './useAsyncData';

export { isEmpty, resolveFeedbackStatus } from './feedbackStatus';
export type { FeedbackStatus, RequestState } from './feedbackStatus';
