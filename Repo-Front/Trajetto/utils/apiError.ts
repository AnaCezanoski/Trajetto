// Leitura do contrato de erro padrão da API.
// Formato e códigos: Repo-Back/backend/docs/CONTRATO-DE-ERRO.md

import axios from 'axios';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'MALFORMED_REQUEST'
  | 'INVALID_PARAMETER'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'ACCESS_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'ENDPOINT_NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'RESOURCE_CONFLICT'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'BUSINESS_RULE_VIOLATION'
  | 'INTERNAL_ERROR'
  | 'EXTERNAL_SERVICE_ERROR';

export interface ApiFieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  code: ApiErrorCode | string;
  message: string;
  path: string;
  method: string;
  traceId: string;
  details?: ApiFieldError[];
}

const DEFAULT_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';
const NETWORK_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

const isApiErrorBody = (data: unknown): data is ApiErrorBody => {
  if (!data || typeof data !== 'object') return false;
  const body = data as Partial<ApiErrorBody>;
  return typeof body.code === 'string'
    && typeof body.message === 'string'
    && typeof body.status === 'number';
};

/** Corpo do erro no contrato padrão, ou null se a resposta não seguir o contrato. */
export const getApiError = (error: unknown): ApiErrorBody | null => {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  return isApiErrorBody(data) ? data : null;
};

/** Código do erro (ex.: 'RESOURCE_CONFLICT') — use para decidir o que fazer na tela. */
export const getErrorCode = (error: unknown): string | null =>
  getApiError(error)?.code ?? null;

/** Status HTTP da resposta, quando houver. */
export const getErrorStatus = (error: unknown): number | null =>
  axios.isAxiosError(error) ? error.response?.status ?? null : null;

/** Identificador para achar a falha no log do servidor. */
export const getTraceId = (error: unknown): string | null =>
  getApiError(error)?.traceId ?? null;

/**
 * Mensagem pronta para mostrar ao usuário.
 * Em erros de validação, junta as mensagens de cada campo rejeitado.
 */
export const getErrorMessage = (error: unknown, fallback: string = DEFAULT_MESSAGE): string => {
  const apiError = getApiError(error);

  if (apiError) {
    if (apiError.details?.length) {
      return apiError.details.map(detail => detail.message).join('\n');
    }
    return apiError.message;
  }

  if (axios.isAxiosError(error)) {
    // Sem resposta = servidor fora do ar, timeout ou celular sem rede.
    if (!error.response) return NETWORK_MESSAGE;

    const data = error.response.data;
    if (typeof data === 'string' && data.trim()) return data;
  }

  return fallback;
};

/**
 * Erros por campo, no formato usado pelos formulários: { email: 'Informe um e-mail válido' }.
 * Vazio quando a falha não é de validação.
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const details = getApiError(error)?.details ?? [];

  return details.reduce<Record<string, string>>((acc, detail) => {
    if (detail.field && !acc[detail.field]) acc[detail.field] = detail.message;
    return acc;
  }, {});
};
