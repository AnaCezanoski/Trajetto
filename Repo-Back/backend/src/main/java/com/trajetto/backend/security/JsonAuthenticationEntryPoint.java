package com.trajetto.backend.security;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiErrorResponseWriter;
import com.trajetto.backend.exception.InvalidSessionException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.WebAttributes;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Devolve 401 no contrato JSON padrão quando um recurso protegido é acessado sem autenticação.
 * <p>
 * O código do erro distingue os três casos, para que o aplicativo saiba o que fazer:
 * <ul>
 *   <li>{@code UNAUTHENTICATED} — não veio token; basta pedir login.</li>
 *   <li>{@code SESSION_EXPIRED} — o token venceu; a sessão salva deve ser descartada.</li>
 *   <li>{@code INVALID_SESSION} — o token não confere; a sessão salva deve ser descartada.</li>
 * </ul>
 * Os dois últimos são detectados pelo {@link JwtTokenFilter}, que deixa o motivo em
 * {@link WebAttributes#AUTHENTICATION_EXCEPTION}.
 */
@Component
@RequiredArgsConstructor
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ApiErrorResponseWriter responseWriter;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        ApiErrorCode code = resolveErrorCode(request, authException);
        responseWriter.write(request, response, code, code.getDefaultMessage());
    }

    private ApiErrorCode resolveErrorCode(HttpServletRequest request, AuthenticationException authException) {
        if (authException instanceof InvalidSessionException invalidSession) {
            return invalidSession.getErrorCode();
        }

        if (request.getAttribute(WebAttributes.AUTHENTICATION_EXCEPTION)
                instanceof InvalidSessionException invalidSession) {
            return invalidSession.getErrorCode();
        }

        return ApiErrorCode.UNAUTHENTICATED;
    }
}
