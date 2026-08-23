package com.trajetto.backend.security;

import com.trajetto.backend.exception.InvalidSessionException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.WebAttributes;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Autentica a requisição a partir do token JWT do cabeçalho {@code Authorization}.
 * <p>
 * Quando o token não vale, o filtro <b>não</b> responde de imediato: registra o motivo em
 * {@link WebAttributes#AUTHENTICATION_EXCEPTION} e segue a cadeia sem autenticação. Quem decide
 * se isso vira erro é a autorização do endpoint — assim uma requisição a um recurso público
 * (login, cadastro, redefinição de senha) continua funcionando mesmo que o aplicativo ainda
 * carregue um token vencido, enquanto um recurso protegido cai no
 * {@link JsonAuthenticationEntryPoint}, que lê o motivo guardado e devolve o código de erro
 * correto ({@code SESSION_EXPIRED} ou {@code INVALID_SESSION}) no contrato JSON da API.
 * <p>
 * Não é um bean: o {@link SecurityConfig} o instancia para que ele exista apenas dentro da
 * cadeia de filtros do Spring Security.
 */
public class JwtTokenFilter extends OncePerRequestFilter {

    private static final Logger log = LogManager.getLogger(JwtTokenFilter.class);

    private final Jwt jwt;

    public JwtTokenFilter(Jwt jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            Authentication authentication = jwt.extract(request);
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (InvalidSessionException ex) {
            SecurityContextHolder.clearContext();
            request.setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, ex);
            log.warn("Sessão recusada em {} {} ({}): {}", request.getMethod(), request.getRequestURI(),
                    ex.getErrorCode(), ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
