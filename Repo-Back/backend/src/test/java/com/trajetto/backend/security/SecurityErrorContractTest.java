package com.trajetto.backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.exception.ApiErrorResponseWriter;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.jackson.io.JacksonSerializer;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Date;
import java.util.function.UnaryOperator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * OB03.2 — as falhas de autenticação e autorização acontecem na cadeia de filtros do Spring
 * Security, fora do alcance do {@code GlobalExceptionHandler}. Este teste percorre o caminho real
 * (filtro de token, depois entry point ou access denied handler) e verifica que a resposta sai em
 * JSON, no mesmo contrato dos demais erros da API, e com um código que diz ao aplicativo o que
 * fazer: pedir login, descartar a sessão salva ou apenas informar a falta de permissão.
 */
class SecurityErrorContractTest {

    private final ObjectMapper objectMapper = Jackson2ObjectMapperBuilder.json().build();
    private final ApiErrorResponseWriter responseWriter = new ApiErrorResponseWriter(objectMapper);
    private final JwtTokenFilter filter = new JwtTokenFilter(new Jwt());
    private final JsonAuthenticationEntryPoint entryPoint = new JsonAuthenticationEntryPoint(responseWriter);
    private final JsonAccessDeniedHandler accessDeniedHandler = new JsonAccessDeniedHandler(responseWriter);

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Recurso protegido sem token responde 401 UNAUTHENTICATED em JSON")
    void semToken() throws Exception {
        MockHttpServletResponse response = protectedRequest(request("GET", "/user/me"));

        JsonNode body = assertContract(response, 401, "UNAUTHENTICATED", "/user/me", "GET");
        assertEquals("Autenticação necessária para acessar este recurso.", body.get("message").asText());
        assertEquals("Bearer realm=\"trajetto-api\"", response.getHeader(HttpHeaders.WWW_AUTHENTICATE));
    }

    @Test
    @DisplayName("Token expirado responde 401 SESSION_EXPIRED, e não um 401 genérico")
    void tokenExpirado() throws Exception {
        MockHttpServletRequest request = request("GET", "/user/me");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken());

        MockHttpServletResponse response = protectedRequest(request);

        JsonNode body = assertContract(response, 401, "SESSION_EXPIRED", "/user/me", "GET");
        assertEquals("Sua sessão expirou. Entre novamente para continuar.", body.get("message").asText());
        assertTrue(response.getHeader(HttpHeaders.WWW_AUTHENTICATE).contains("error=\"invalid_token\""));
    }

    @Test
    @DisplayName("Token assinado com outra chave responde 401 INVALID_SESSION")
    void tokenAdulterado() throws Exception {
        MockHttpServletRequest request = request("GET", "/user/me");
        request.addHeader(HttpHeaders.AUTHORIZATION,
                "Bearer " + tokenSignedWith("chave-de-outro-servidor-com-tamanho-suficiente"));

        MockHttpServletResponse response = protectedRequest(request);

        assertContract(response, 401, "INVALID_SESSION", "/user/me", "GET");
    }

    @Test
    @DisplayName("Texto qualquer no lugar do token responde 401 INVALID_SESSION")
    void tokenIlegivel() throws Exception {
        MockHttpServletRequest request = request("GET", "/user/me");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer nao-e-um-token");

        MockHttpServletResponse response = protectedRequest(request);

        assertContract(response, 401, "INVALID_SESSION", "/user/me", "GET");
    }

    @Test
    @DisplayName("Token de outro emissor responde 401 INVALID_SESSION")
    void tokenDeOutroEmissor() throws Exception {
        MockHttpServletRequest request = request("GET", "/user/me");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer "
                + token(builder -> builder.issuer("outro-servidor").expiration(hoursFromNow(1))));

        MockHttpServletResponse response = protectedRequest(request);

        assertContract(response, 401, "INVALID_SESSION", "/user/me", "GET");
    }

    @Test
    @DisplayName("O motivo técnico da recusa fica no log, e não no corpo da resposta")
    void motivoTecnicoNaoVazaNaResposta() throws Exception {
        MockHttpServletRequest request = request("GET", "/user/me");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer nao-e-um-token");

        String body = protectedRequest(request).getContentAsString();

        assertTrue(body.contains("INVALID_SESSION"));
        assertFalse(body.contains("nao-e-um-token"));
        assertFalse(body.toLowerCase().contains("jwt"));
    }

    @Test
    @DisplayName("Token válido autentica a requisição")
    void tokenValido() throws Exception {
        MockHttpServletRequest request = request("GET", "/user/me");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer "
                + token(builder -> builder.issuer(Jwt.ISSUER).expiration(hoursFromNow(1))));

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(1L, ((UserToken) authentication.getPrincipal()).getId());
        assertTrue(authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    @DisplayName("Token vencido em rota pública não bloqueia a requisição")
    void tokenVencidoEmRotaPublica() throws Exception {
        MockHttpServletRequest request = request("POST", "/user/login");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken());
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        // O filtro apenas anota o motivo; quem responde 401 é o entry point, e só quando o
        // endpoint exige autenticação. Aqui a requisição segue adiante, como anônima — senão o
        // aplicativo com token vencido não conseguiria nem refazer o login.
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertNotNull(chain.getRequest());
        assertEquals(200, response.getStatus());
    }

    @Test
    @DisplayName("Usuário autenticado sem permissão responde 403 ACCESS_DENIED em JSON")
    void semPermissao() throws Exception {
        MockHttpServletRequest request = request("DELETE", "/user/7");
        MockHttpServletResponse response = new MockHttpServletResponse();

        accessDeniedHandler.handle(request, response, new AccessDeniedException("Access Denied"));

        JsonNode body = assertContract(response, 403, "ACCESS_DENIED", "/user/7", "DELETE");
        assertEquals("Você não tem permissão para executar esta operação.", body.get("message").asText());
        // 403 não é um desafio de autenticação: repetir o login não resolveria.
        assertNull(response.getHeader(HttpHeaders.WWW_AUTHENTICATE));
    }

    // ─── Apoio ────────────────────────────────────────────────────────────────

    /** Passa a requisição pelo filtro e, como se o endpoint exigisse login, pelo entry point. */
    private MockHttpServletResponse protectedRequest(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());
        entryPoint.commence(request, response,
                new InsufficientAuthenticationException("Full authentication is required"));

        return response;
    }

    /** Campos obrigatórios do contrato, os mesmos exigidos de qualquer erro da API. */
    private JsonNode assertContract(MockHttpServletResponse response,
                                    int expectedStatus,
                                    String expectedCode,
                                    String expectedPath,
                                    String expectedMethod) throws Exception {
        assertEquals(expectedStatus, response.getStatus());
        assertTrue(response.getContentType().startsWith(MediaType.APPLICATION_JSON_VALUE));

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertEquals(expectedStatus, body.get("status").asInt());
        assertEquals(expectedCode, body.get("code").asText());
        assertEquals(expectedPath, body.get("path").asText());
        assertEquals(expectedMethod, body.get("method").asText());
        assertTrue(body.hasNonNull("timestamp"));
        assertTrue(body.hasNonNull("error"));
        assertTrue(body.hasNonNull("traceId"));
        assertTrue(body.hasNonNull("message"));
        return body;
    }

    private MockHttpServletRequest request(String method, String uri) {
        return new MockHttpServletRequest(method, uri);
    }

    private String expiredToken() {
        return token(builder -> builder.issuer(Jwt.ISSUER).expiration(hoursFromNow(-1)));
    }

    private String tokenSignedWith(String secret) {
        return Jwts.builder()
                .json(new JacksonSerializer<>())
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .issuer(Jwt.ISSUER)
                .subject("1")
                .issuedAt(new Date())
                .expiration(hoursFromNow(1))
                .claim(Jwt.USER_FIELD, new UserToken(1L, "Ana"))
                .compact();
    }

    private String token(UnaryOperator<JwtBuilder> customizer) {
        JwtBuilder builder = Jwts.builder()
                .json(new JacksonSerializer<>())
                .signWith(Keys.hmacShaKeyFor(Jwt.SECRET.getBytes()))
                .subject("1")
                .issuedAt(new Date())
                .claim(Jwt.USER_FIELD, new UserToken(1L, "Ana"));

        return customizer.apply(builder).compact();
    }

    private Date hoursFromNow(long hours) {
        return new Date(System.currentTimeMillis() + hours * 3_600_000L);
    }
}
