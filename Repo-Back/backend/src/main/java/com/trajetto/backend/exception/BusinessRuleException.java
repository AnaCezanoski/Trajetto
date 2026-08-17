package com.trajetto.backend.exception;

/**
 * Regra de negócio violada: a requisição está bem formada, mas não pode ser processada
 * no estado atual da aplicação — HTTP 422.
 */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(String message) {
        super(ApiErrorCode.BUSINESS_RULE_VIOLATION, message);
    }
}
