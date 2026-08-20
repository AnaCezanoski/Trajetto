package com.trajetto.backend.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Escreve o {@link ApiError} diretamente na resposta HTTP.
 * <p>
 * Necessário para as falhas que acontecem na cadeia de filtros do Spring Security — antes do
 * {@code DispatcherServlet} e, portanto, fora do alcance do {@link GlobalExceptionHandler}.
 * Garante que 401 e 403 sigam o mesmo contrato dos demais erros da API.
 */
@Component
@RequiredArgsConstructor
public class ApiErrorResponseWriter {

    private static final Logger logger = LogManager.getLogger(ApiErrorResponseWriter.class);

    /** Identifica a API no cabeçalho {@code WWW-Authenticate} das respostas 401. */
    public static final String REALM = "trajetto-api";

    private final ObjectMapper objectMapper;

    public void write(HttpServletRequest request,
                      HttpServletResponse response,
                      ApiErrorCode code,
                      String message) throws IOException {

        ApiError apiError = ApiError.of(code, message, request.getRequestURI(), request.getMethod());

        if (response.isCommitted()) {
            // A resposta já começou a ser enviada; sobrescrevê-la produziria um corpo inválido.
            logger.warn("[{}] resposta já enviada, {} {} não pôde receber o contrato de erro {}",
                    apiError.traceId(), apiError.method(), apiError.path(), apiError.code());
            return;
        }

        // resetBuffer, e não reset: descarta um corpo parcial sem apagar cabeçalhos já postos
        // por outros filtros (CORS, por exemplo), que o cliente precisa para ler a resposta.
        response.resetBuffer();
        response.setStatus(apiError.status());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        if (apiError.status() == HttpStatus.UNAUTHORIZED.value()) {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, bearerChallenge(code));
        }

        logger.warn("[{}] {} {} -> {} ({})", apiError.traceId(), apiError.method(), apiError.path(),
                apiError.status(), apiError.code());

        objectMapper.writeValue(response.getWriter(), apiError);
    }

    /**
     * Desafio do cabeçalho {@code WWW-Authenticate} exigido pelo HTTP em respostas 401.
     * <p>
     * Segue a RFC 6750, que aceita apenas ASCII no {@code error_description} — por isso o texto
     * do desafio é fixo em inglês; a mensagem para o usuário vai no corpo JSON.
     */
    public static String bearerChallenge(ApiErrorCode code) {
        String challenge = "Bearer realm=\"" + REALM + "\"";

        return switch (code) {
            case SESSION_EXPIRED -> challenge + ", error=\"invalid_token\", error_description=\"The access token expired\"";
            case INVALID_SESSION -> challenge + ", error=\"invalid_token\", error_description=\"The access token is invalid\"";
            case INVALID_CREDENTIALS -> challenge + ", error=\"invalid_request\", error_description=\"Invalid credentials\"";
            default -> challenge;
        };
    }
}
