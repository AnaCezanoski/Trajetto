package com.trajetto.backend.exception;

import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O que falha fora dos controllers — em um filtro, ou via {@code response.sendError()} — é
 * despachado pelo container para {@code /error}, sem passar pelo {@link GlobalExceptionHandler}.
 * Este teste garante que também essas respostas saem no contrato da API.
 */
class ApiErrorControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ApiErrorController()).build();
    }

    @Test
    @DisplayName("Erro despachado para /error sai no contrato, apontando a rota original")
    void erroDespachado() throws Exception {
        mockMvc.perform(get("/error")
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 401)
                        .requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/user/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
                .andExpect(jsonPath("$.path").value("/user/me"))
                .andExpect(jsonPath("$.method").value("GET"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("Rota inexistente sai como ENDPOINT_NOT_FOUND")
    void rotaInexistente() throws Exception {
        mockMvc.perform(get("/error")
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404)
                        .requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/rota/que/nao/existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ENDPOINT_NOT_FOUND"))
                .andExpect(jsonPath("$.path").value("/rota/que/nao/existe"));
    }

    @Test
    @DisplayName("Sem status conhecido, responde 500 no contrato")
    void semStatusConhecido() throws Exception {
        mockMvc.perform(get("/error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.path").value("/error"));
    }
}
