package com.trajetto.backend.exception;

/** Conflito com o estado atual dos dados (ex.: e-mail já cadastrado) — HTTP 409. */
public class ResourceConflictException extends ApiException {

    public ResourceConflictException(String message) {
        super(ApiErrorCode.RESOURCE_CONFLICT, message);
    }
}
