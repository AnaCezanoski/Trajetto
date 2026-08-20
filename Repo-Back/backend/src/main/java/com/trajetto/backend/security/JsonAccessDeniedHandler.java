package com.trajetto.backend.security;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiErrorResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Devolve 403 no contrato JSON padrão quando o usuário está autenticado, mas não tem permissão
 * para a operação.
 * <p>
 * A resposta não diz qual permissão faltou: isso revelaria a estrutura de autorização da API a
 * quem não deveria conhecê-la. O detalhe fica no log, alcançável pelo {@code traceId}.
 */
@Component
@RequiredArgsConstructor
public class JsonAccessDeniedHandler implements AccessDeniedHandler {

    private final ApiErrorResponseWriter responseWriter;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        responseWriter.write(request, response, ApiErrorCode.ACCESS_DENIED,
                ApiErrorCode.ACCESS_DENIED.getDefaultMessage());
    }
}
