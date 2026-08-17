package com.trajetto.backend.exception;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * As falhas de autenticação e autorização acontecem na cadeia de filtros do Spring Security,
 * fora do alcance do {@link GlobalExceptionHandler}. Este teste garante que elas saem no
 * mesmo contrato JSON.
 */
class ApiErrorResponseWriterTest {

    private final ObjectMapper objectMapper = Jackson2ObjectMapperBuilder.json().build();
    private final ApiErrorResponseWriter writer = new ApiErrorResponseWriter(objectMapper);

    @Test
    @DisplayName("Requisição sem token recebe 401 no contrato padrão")
    void unauthenticated() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/user/me");
        MockHttpServletResponse response = new MockHttpServletResponse();

        writer.write(request, response, ApiErrorCode.UNAUTHENTICATED,
                ApiErrorCode.UNAUTHENTICATED.getDefaultMessage());

        assertEquals(401, response.getStatus());
        assertTrue(response.getContentType().startsWith(MediaType.APPLICATION_JSON_VALUE));

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertEquals(401, body.get("status").asInt());
        assertEquals("UNAUTHENTICATED", body.get("code").asText());
        assertEquals("/user/me", body.get("path").asText());
        assertEquals("GET", body.get("method").asText());
        assertTrue(body.hasNonNull("timestamp"));
        assertTrue(body.hasNonNull("traceId"));
        assertTrue(body.hasNonNull("message"));
    }

    @Test
    @DisplayName("Usuário sem permissão recebe 403 no contrato padrão")
    void accessDenied() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/user/7");
        MockHttpServletResponse response = new MockHttpServletResponse();

        writer.write(request, response, ApiErrorCode.ACCESS_DENIED,
                ApiErrorCode.ACCESS_DENIED.getDefaultMessage());

        assertEquals(403, response.getStatus());

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertEquals("ACCESS_DENIED", body.get("code").asText());
        assertEquals("/user/7", body.get("path").asText());
        assertEquals("DELETE", body.get("method").asText());
    }
}
