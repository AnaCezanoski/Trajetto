package com.trajetto.backend.exception;

/** Usuário autenticado tentando operar sobre um recurso que não lhe pertence — HTTP 403. */
public class ForbiddenOperationException extends ApiException {

    public ForbiddenOperationException(String message) {
        super(ApiErrorCode.ACCESS_DENIED, message);
    }
}
