package com.trajetto.backend.exception;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Substitui a página/JSON de erro padrão do Spring Boot pelo contrato da API.
 * <p>
 * Falhas levantadas fora dos controllers — em um filtro, ou uma chamada a
 * {@code response.sendError()} — não passam pelo {@link GlobalExceptionHandler}: o container
 * despacha a requisição para {@code /error}. Sem este controller, essas respostas sairiam em um
 * formato diferente do resto da API, e o aplicativo não conseguiria lê-las.
 */
@RestController
public class ApiErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<ApiError> handleError(HttpServletRequest request) {
        HttpStatus status = resolveStatus(request);
        ApiErrorCode code = status == HttpStatus.NOT_FOUND
                ? ApiErrorCode.ENDPOINT_NOT_FOUND
                : ApiErrorCode.fromStatus(status);

        // Só o status é aproveitado: a mensagem original pode conter detalhes internos.
        ApiError apiError = ApiError.of(code, code.getDefaultMessage(), originalPath(request),
                request.getMethod(), List.of());

        return ResponseEntity.status(status).body(apiError);
    }

    private HttpStatus resolveStatus(HttpServletRequest request) {
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (statusCode instanceof Integer value) {
            HttpStatus resolved = HttpStatus.resolve(value);
            if (resolved != null) {
                return resolved;
            }
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    /** URI que o cliente chamou, e não o {@code /error} para onde o container despachou. */
    private String originalPath(HttpServletRequest request) {
        Object originalUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        return originalUri instanceof String uri ? uri : request.getRequestURI();
    }
}
