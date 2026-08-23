package com.trajetto.backend.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * A sessão apresentada pelo cliente não pôde ser aceita: token expirado, corrompido, com
 * assinatura inválida ou emitido por outro servidor.
 * <p>
 * Diferente das demais falhas de segurança, esta carrega o motivo em um {@link ApiErrorCode}
 * específico ({@code SESSION_EXPIRED} ou {@code INVALID_SESSION}), para que o aplicativo saiba
 * distinguir "a sessão acabou, peça login de novo" de "esta requisição não trouxe token".
 * <p>
 * Estende {@code AuthenticationException} para ser reconhecida como falha de autenticação tanto
 * pelo Spring Security quanto pelo {@link GlobalExceptionHandler}. A mensagem construída aqui é
 * técnica e serve ao log; o que chega ao cliente é a mensagem padrão do {@link ApiErrorCode}.
 */
public class InvalidSessionException extends AuthenticationException {

    private final ApiErrorCode errorCode;

    public InvalidSessionException(ApiErrorCode errorCode, String message) {
        this(errorCode, message, null);
    }

    public InvalidSessionException(ApiErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ApiErrorCode getErrorCode() {
        return errorCode;
    }
}
