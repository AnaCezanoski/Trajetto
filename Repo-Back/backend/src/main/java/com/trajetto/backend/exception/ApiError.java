package com.trajetto.backend.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Contrato único de erro da API.
 * <p>
 * Toda falha tratada pela aplicação — de negócio, de validação, de segurança ou inesperada —
 * é convertida para este formato pelo {@link GlobalExceptionHandler}, de modo que o frontend
 * sempre receba a mesma estrutura JSON:
 *
 * <pre>
 * {
 *   "timestamp": "2026-08-16T14:03:22.123-03:00",  // momento da ocorrência
 *   "status": 404,                                  // status HTTP
 *   "error": "Not Found",                           // descrição do status HTTP
 *   "code": "RESOURCE_NOT_FOUND",                   // identificação do erro
 *   "message": "Usuário não encontrado.",           // mensagem legível
 *   "path": "/user/42",                             // origem da falha
 *   "method": "GET",
 *   "traceId": "3f1c2b9e",                          // correlação com o log do servidor
 *   "details": [                                    // presente apenas em erros de validação
 *     { "field": "email", "message": "deve ser um e-mail válido", "rejectedValue": "abc" }
 *   ]
 * }
 * </pre>
 */
public record ApiError(

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        OffsetDateTime timestamp,

        int status,

        String error,

        String code,

        String message,

        String path,

        String method,

        String traceId,

        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        List<FieldError> details
) {

    /** Detalhe de um campo específico rejeitado na validação. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record FieldError(String field, String message, Object rejectedValue) {
    }

    public static ApiError of(ApiErrorCode code, String message, String path, String method) {
        return of(code, message, path, method, List.of());
    }

    public static ApiError of(ApiErrorCode code,
                              String message,
                              String path,
                              String method,
                              List<FieldError> details) {
        return new ApiError(
                OffsetDateTime.now(),
                code.getStatus().value(),
                code.getStatus().getReasonPhrase(),
                code.name(),
                message != null && !message.isBlank() ? message : code.getDefaultMessage(),
                path,
                method,
                newTraceId(),
                details
        );
    }

    private static String newTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
