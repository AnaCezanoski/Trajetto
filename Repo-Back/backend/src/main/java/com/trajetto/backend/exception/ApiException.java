package com.trajetto.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exceção base das falhas de negócio da aplicação.
 * <p>
 * Carrega o {@link ApiErrorCode} que define o status HTTP e a identificação do erro, permitindo
 * que o {@link GlobalExceptionHandler} traduza a falha para o contrato JSON sem que os
 * controllers precisem tratar exceções.
 */
public class ApiException extends RuntimeException {

    private final ApiErrorCode errorCode;

    public ApiException(ApiErrorCode errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }

    public ApiException(ApiErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ApiException(ApiErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ApiErrorCode getErrorCode() {
        return errorCode;
    }

    public HttpStatus getStatus() {
        return errorCode.getStatus();
    }
}
