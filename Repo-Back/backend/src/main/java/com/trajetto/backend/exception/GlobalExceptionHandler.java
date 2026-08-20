package com.trajetto.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * Ponto único de tratamento de exceções da API.
 * <p>
 * Intercepta qualquer falha lançada pelos controllers — de negócio, de validação, de segurança
 * ou inesperada — e a converte para o contrato constante definido em {@link ApiError}. Com isso
 * os controllers deixam de precisar de blocos {@code try/catch} e o frontend passa a receber
 * sempre a mesma estrutura JSON, independentemente da origem do erro.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LogManager.getLogger(GlobalExceptionHandler.class);

    // ─── Falhas de negócio da aplicação ───────────────────────────────────────

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException ex, HttpServletRequest request) {
        return build(ex.getErrorCode(), ex.getMessage(), request, List.of(), ex);
    }

    // ─── Falhas de validação ──────────────────────────────────────────────────

    /** Corpo da requisição anotado com {@code @Valid} reprovado no Bean Validation. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                HttpServletRequest request) {
        List<ApiError.FieldError> details = new ArrayList<>();
        for (ObjectError error : ex.getBindingResult().getAllErrors()) {
            if (error instanceof FieldError fieldError) {
                details.add(new ApiError.FieldError(
                        fieldError.getField(),
                        fieldError.getDefaultMessage(),
                        fieldError.getRejectedValue()));
            } else {
                details.add(new ApiError.FieldError(error.getObjectName(), error.getDefaultMessage(), null));
            }
        }
        return build(ApiErrorCode.VALIDATION_ERROR, ApiErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                request, details, ex);
    }

    /** Validação aplicada diretamente a parâmetros do método do controller. */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> handleHandlerMethodValidation(HandlerMethodValidationException ex,
                                                                 HttpServletRequest request) {
        List<ApiError.FieldError> details = new ArrayList<>();
        ex.getParameterValidationResults().forEach(result -> {
            String parameterName = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().forEach(error ->
                    details.add(new ApiError.FieldError(parameterName, error.getDefaultMessage(), null)));
        });
        return build(ApiErrorCode.VALIDATION_ERROR, ApiErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                request, details, ex);
    }

    /** Validação disparada fora da camada web (ex.: {@code @Validated} em services). */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex,
                                                             HttpServletRequest request) {
        List<ApiError.FieldError> details = new ArrayList<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            details.add(new ApiError.FieldError(
                    String.valueOf(violation.getPropertyPath()),
                    violation.getMessage(),
                    violation.getInvalidValue()));
        }
        return build(ApiErrorCode.VALIDATION_ERROR, ApiErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                request, details, ex);
    }

    // ─── Requisições malformadas ──────────────────────────────────────────────

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleNotReadable(HttpMessageNotReadableException ex,
                                                     HttpServletRequest request) {
        return build(ApiErrorCode.MALFORMED_REQUEST, ApiErrorCode.MALFORMED_REQUEST.getDefaultMessage(),
                request, List.of(), ex);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParameter(MissingServletRequestParameterException ex,
                                                          HttpServletRequest request) {
        String message = "O parâmetro '" + ex.getParameterName() + "' é obrigatório.";
        return build(ApiErrorCode.INVALID_PARAMETER, message, request, List.of(), ex);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                      HttpServletRequest request) {
        String message = "O valor '" + ex.getValue() + "' é inválido para o parâmetro '" + ex.getName() + "'.";
        return build(ApiErrorCode.INVALID_PARAMETER, message, request, List.of(), ex);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex,
                                                         HttpServletRequest request) {
        return build(ApiErrorCode.INVALID_PARAMETER, ex.getMessage(), request, List.of(), ex);
    }

    // ─── Rota, método e formato ───────────────────────────────────────────────

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiError> handleNotFound(Exception ex, HttpServletRequest request) {
        String message = "Nenhum endpoint mapeado para " + request.getMethod() + " " + request.getRequestURI() + ".";
        return build(ApiErrorCode.ENDPOINT_NOT_FOUND, message, request, List.of(), ex);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                                                            HttpServletRequest request) {
        String message = "O método " + ex.getMethod() + " não é suportado por este endpoint.";
        return build(ApiErrorCode.METHOD_NOT_ALLOWED, message, request, List.of(), ex);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex,
                                                               HttpServletRequest request) {
        return build(ApiErrorCode.UNSUPPORTED_MEDIA_TYPE, ex.getMessage(), request, List.of(), ex);
    }

    // ─── Segurança ────────────────────────────────────────────────────────────

    /**
     * Falha de autenticação. O código distingue o motivo — credenciais erradas no login, sessão
     * vencida ou sessão inválida — para que o aplicativo saiba se deve mostrar "senha incorreta"
     * ou descartar a sessão salva e pedir login de novo.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex,
                                                        HttpServletRequest request) {
        ApiErrorCode code = authenticationErrorCode(ex);
        return build(code, code.getDefaultMessage(), request, List.of(), ex);
    }

    /**
     * Autorização negada, normalmente por {@code @PreAuthorize}. Sem usuário autenticado a falha
     * é de autenticação (401) e não de permissão (403): responder 403 faria o aplicativo tratar
     * como "sem acesso" um caso em que bastava entrar na conta.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex,
                                                      HttpServletRequest request) {
        ApiErrorCode code = isAuthenticated() ? ApiErrorCode.ACCESS_DENIED : ApiErrorCode.UNAUTHENTICATED;
        return build(code, code.getDefaultMessage(), request, List.of(), ex);
    }

    private ApiErrorCode authenticationErrorCode(AuthenticationException ex) {
        if (ex instanceof InvalidSessionException invalidSession) {
            return invalidSession.getErrorCode();
        }
        if (ex instanceof BadCredentialsException) {
            return ApiErrorCode.INVALID_CREDENTIALS;
        }
        return ApiErrorCode.UNAUTHENTICATED;
    }

    private boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    // ─── Persistência ─────────────────────────────────────────────────────────

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex,
                                                       HttpServletRequest request) {
        return build(ApiErrorCode.RESOURCE_CONFLICT, ApiErrorCode.RESOURCE_CONFLICT.getDefaultMessage(),
                request, List.of(), ex);
    }

    // ─── Exceções que já carregam status HTTP ─────────────────────────────────

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex,
                                                        HttpServletRequest request) {
        ApiErrorCode code = ApiErrorCode.fromStatus(HttpStatus.resolve(ex.getStatusCode().value()));
        String message = ex.getReason() != null ? ex.getReason() : code.getDefaultMessage();
        return build(code, message, request, List.of(), ex);
    }

    // ─── Rede de segurança: qualquer outra falha ──────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        // A mensagem original não é exposta ao cliente para não vazar detalhes internos;
        // ela fica no log, correlacionada pelo traceId devolvido na resposta.
        return build(ApiErrorCode.INTERNAL_ERROR, ApiErrorCode.INTERNAL_ERROR.getDefaultMessage(),
                request, List.of(), ex);
    }

    // ─── Montagem e log da resposta ───────────────────────────────────────────

    private ResponseEntity<ApiError> build(ApiErrorCode code,
                                           String message,
                                           HttpServletRequest request,
                                           List<ApiError.FieldError> details,
                                           Exception ex) {
        ApiError apiError = ApiError.of(code, message, request.getRequestURI(), request.getMethod(), details);

        if (apiError.status() >= HttpStatus.INTERNAL_SERVER_ERROR.value()) {
            logger.error("[{}] {} {} -> {} ({})", apiError.traceId(), apiError.method(), apiError.path(),
                    apiError.status(), apiError.code(), ex);
        } else {
            logger.warn("[{}] {} {} -> {} ({}): {}", apiError.traceId(), apiError.method(), apiError.path(),
                    apiError.status(), apiError.code(), ex.getMessage());
        }

        if (apiError.status() == HttpStatus.UNAUTHORIZED.value()) {
            // Exigido pelo HTTP em respostas 401; identifica o esquema e o motivo da recusa.
            return ResponseEntity.status(apiError.status())
                    .header(HttpHeaders.WWW_AUTHENTICATE, ApiErrorResponseWriter.bearerChallenge(code))
                    .body(apiError);
        }

        return ResponseEntity.status(apiError.status()).body(apiError);
    }

}
