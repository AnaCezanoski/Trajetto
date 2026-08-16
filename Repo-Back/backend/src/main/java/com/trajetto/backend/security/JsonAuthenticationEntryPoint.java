package com.trajetto.backend.security;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiErrorResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Devolve 401 no contrato JSON padrão quando a requisição não possui um token válido. */
@Component
@RequiredArgsConstructor
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ApiErrorResponseWriter responseWriter;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        responseWriter.write(request, response, ApiErrorCode.UNAUTHENTICATED,
                ApiErrorCode.UNAUTHENTICATED.getDefaultMessage());
    }
}
