package com.trajetto.backend.exception;

/** Dado enviado é inválido além do que o Bean Validation consegue verificar — HTTP 400. */
public class InvalidRequestException extends ApiException {

    public InvalidRequestException(String message) {
        super(ApiErrorCode.INVALID_PARAMETER, message);
    }
}
