package com.trajetto.backend.exception;

/** Recurso solicitado não existe — resulta em HTTP 404 com code {@code RESOURCE_NOT_FOUND}. */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(ApiErrorCode.RESOURCE_NOT_FOUND, message);
    }

    public ResourceNotFoundException(String resource, Object identifier) {
        super(ApiErrorCode.RESOURCE_NOT_FOUND, resource + " não encontrado(a) para o identificador " + identifier + ".");
    }
}
