package com.trajetto.backend.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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

    private final ObjectMapper objectMapper;

    public void write(HttpServletRequest request,
                      HttpServletResponse response,
                      ApiErrorCode code,
                      String message) throws IOException {

        ApiError apiError = ApiError.of(code, message, request.getRequestURI(), request.getMethod());

        response.setStatus(apiError.status());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(), apiError);
    }
}
