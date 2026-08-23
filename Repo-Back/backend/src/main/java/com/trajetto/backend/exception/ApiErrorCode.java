package com.trajetto.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * Identificação estável de cada tipo de falha da API.
 * <p>
 * O nome da constante é o valor publicado no campo {@code code} do {@link ApiError}; o frontend
 * pode reagir a ele sem depender do texto da mensagem, que é destinado ao usuário final.
 */
public enum ApiErrorCode {

    /** Corpo ou parâmetros da requisição reprovados na validação (Bean Validation). */
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Existem campos inválidos na requisição."),

    /** JSON malformado ou incompatível com o formato esperado. */
    MALFORMED_REQUEST(HttpStatus.BAD_REQUEST, "Não foi possível interpretar o corpo da requisição."),

    /** Parâmetro obrigatório ausente ou com tipo incompatível. */
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "Parâmetro inválido na requisição."),

    /** Credenciais incorretas na autenticação. */
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos."),

    /** Requisição sem token em recurso protegido. */
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "Autenticação necessária para acessar este recurso."),

    /** Token apresentado já passou da validade — a sessão precisa ser refeita. */
    SESSION_EXPIRED(HttpStatus.UNAUTHORIZED, "Sua sessão expirou. Entre novamente para continuar."),

    /** Token corrompido, sem assinatura válida ou emitido por outro servidor. */
    INVALID_SESSION(HttpStatus.UNAUTHORIZED, "Sua sessão não é mais válida. Entre novamente para continuar."),

    /** Usuário autenticado sem permissão para a operação. */
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Você não tem permissão para executar esta operação."),

    /** Recurso solicitado não existe. */
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Recurso não encontrado."),

    /** Rota inexistente na API. */
    ENDPOINT_NOT_FOUND(HttpStatus.NOT_FOUND, "Endpoint não encontrado."),

    /** Método HTTP não suportado pela rota. */
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP não suportado por este endpoint."),

    /** Conflito com o estado atual dos dados (duplicidade, integridade referencial). */
    RESOURCE_CONFLICT(HttpStatus.CONFLICT, "O recurso já existe ou conflita com os dados atuais."),

    /** Content-Type não suportado. */
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato de conteúdo não suportado."),

    /** Regra de negócio violada — requisição bem formada, porém não processável. */
    BUSINESS_RULE_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY, "Não foi possível concluir a operação."),

    /** Falha inesperada no servidor. */
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor."),

    /** Falha na comunicação com um serviço externo (Overpass, OpenTripMap, e-mail). */
    EXTERNAL_SERVICE_ERROR(HttpStatus.BAD_GATEWAY, "Serviço externo indisponível no momento.");

    private final HttpStatus status;
    private final String defaultMessage;

    ApiErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }

    /**
     * Código correspondente a um status HTTP, usado quando a falha chega apenas com o status,
     * sem exceção tipada — caso do {@code ResponseStatusException} e do despacho interno para
     * {@code /error}.
     */
    public static ApiErrorCode fromStatus(HttpStatus status) {
        if (status == null) {
            return INTERNAL_ERROR;
        }
        return switch (status) {
            case BAD_REQUEST -> INVALID_PARAMETER;
            case UNAUTHORIZED -> UNAUTHENTICATED;
            case FORBIDDEN -> ACCESS_DENIED;
            case NOT_FOUND -> RESOURCE_NOT_FOUND;
            case METHOD_NOT_ALLOWED -> METHOD_NOT_ALLOWED;
            case CONFLICT -> RESOURCE_CONFLICT;
            case UNSUPPORTED_MEDIA_TYPE -> UNSUPPORTED_MEDIA_TYPE;
            case UNPROCESSABLE_ENTITY -> BUSINESS_RULE_VIOLATION;
            case BAD_GATEWAY, SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT -> EXTERNAL_SERVICE_ERROR;
            default -> INTERNAL_ERROR;
        };
    }
}
