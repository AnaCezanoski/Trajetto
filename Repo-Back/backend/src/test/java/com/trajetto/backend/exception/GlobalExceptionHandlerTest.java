package com.trajetto.backend.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Garante que qualquer falha — de negócio, de validação, de segurança ou inesperada — sai da API
 * no mesmo formato JSON definido por {@link ApiError}.
 */
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Recurso inexistente retorna 404 no contrato padrão")
    void resourceNotFound() throws Exception {
        assertContract(mockMvc.perform(get("/test/not-found")), 404, "RESOURCE_NOT_FOUND", "/test/not-found", "GET")
                .andExpect(jsonPath("$.message").value("Usuário não encontrado(a) para o identificador 99."));
    }

    @Test
    @DisplayName("Regra de negócio violada retorna 422 no contrato padrão")
    void businessRule() throws Exception {
        assertContract(mockMvc.perform(get("/test/business-rule")), 422, "BUSINESS_RULE_VIOLATION",
                "/test/business-rule", "GET")
                .andExpect(jsonPath("$.message").value("Conta não verificada."));
    }

    @Test
    @DisplayName("Operação sobre recurso de outro usuário retorna 403 no contrato padrão")
    void forbiddenOperation() throws Exception {
        assertContract(mockMvc.perform(get("/test/forbidden")), 403, "ACCESS_DENIED", "/test/forbidden", "GET");
    }

    @Test
    @DisplayName("Conflito de dados retorna 409 no contrato padrão")
    void conflict() throws Exception {
        assertContract(mockMvc.perform(get("/test/conflict")), 409, "RESOURCE_CONFLICT", "/test/conflict", "GET")
                .andExpect(jsonPath("$.message").value("Este e-mail já está em uso."));
    }

    @Test
    @DisplayName("Credenciais inválidas retornam 401 no contrato padrão")
    void invalidCredentials() throws Exception {
        assertContract(mockMvc.perform(post("/test/login")), 401, "INVALID_CREDENTIALS", "/test/login", "POST");
    }

    @Test
    @DisplayName("Acesso negado pelo Spring Security retorna 403 no contrato padrão")
    void accessDenied() throws Exception {
        assertContract(mockMvc.perform(get("/test/denied")), 403, "ACCESS_DENIED", "/test/denied", "GET");
    }

    @Test
    @DisplayName("Falha inesperada retorna 500 no contrato padrão, sem vazar detalhes internos")
    void unexpectedFailure() throws Exception {
        assertContract(mockMvc.perform(get("/test/boom")), 500, "INTERNAL_ERROR", "/test/boom", "GET")
                .andExpect(jsonPath("$.message").value("Erro interno no servidor."));
    }

    @Test
    @DisplayName("Falha de validação retorna 400 no mesmo contrato, detalhando os campos")
    void validationFailure() throws Exception {
        ResultActions result = mockMvc.perform(post("/test/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nao-e-email\",\"name\":\"\",\"age\":10}"));

        assertContract(result, 400, "VALIDATION_ERROR", "/test/validate", "POST")
                .andExpect(jsonPath("$.message").value("Existem campos inválidos na requisição."))
                .andExpect(jsonPath("$.details.length()").value(3))
                .andExpect(jsonPath("$.details[?(@.field == 'name')].message")
                        .value("O nome é obrigatório"))
                .andExpect(jsonPath("$.details[?(@.field == 'email')].rejectedValue")
                        .value("nao-e-email"));
    }

    @Test
    @DisplayName("JSON malformado retorna 400 no mesmo contrato")
    void malformedJson() throws Exception {
        ResultActions result = mockMvc.perform(post("/test/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ isso não é json }"));

        assertContract(result, 400, "MALFORMED_REQUEST", "/test/validate", "POST");
    }

    @Test
    @DisplayName("Parâmetro com tipo incompatível retorna 400 no mesmo contrato")
    void typeMismatch() throws Exception {
        assertContract(mockMvc.perform(get("/test/param?id=abc")), 400, "INVALID_PARAMETER", "/test/param", "GET");
    }

    /** Verifica os campos obrigatórios do contrato, presentes em toda resposta de erro. */
    private ResultActions assertContract(ResultActions result,
                                         int expectedStatus,
                                         String expectedCode,
                                         String expectedPath,
                                         String expectedMethod) throws Exception {
        return result
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(expectedStatus))
                .andExpect(jsonPath("$.error").isNotEmpty())
                .andExpect(jsonPath("$.code").value(expectedCode))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.path").value(expectedPath))
                .andExpect(jsonPath("$.method").value(expectedMethod))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    // ─── Controller de apoio, exclusivo do teste ──────────────────────────────

    @RestController
    @RequestMapping("/test")
    static class TestController {

        @GetMapping("/not-found")
        void notFound() {
            throw new ResourceNotFoundException("Usuário", 99L);
        }

        @GetMapping("/business-rule")
        void businessRule() {
            throw new BusinessRuleException("Conta não verificada.");
        }

        @GetMapping("/forbidden")
        void forbidden() {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }

        @GetMapping("/conflict")
        void conflict() {
            throw new ResourceConflictException("Este e-mail já está em uso.");
        }

        @PostMapping("/login")
        void login() {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        @GetMapping("/denied")
        void denied() {
            throw new AccessDeniedException("Acesso negado");
        }

        @GetMapping("/boom")
        void boom() {
            throw new IllegalStateException("detalhe interno que não deve vazar");
        }

        @GetMapping("/param")
        void param(@RequestParam Long id) {
        }

        @PostMapping("/validate")
        void validate(@Valid @RequestBody TestPayload payload) {
        }
    }

    record TestPayload(
            @NotBlank(message = "O nome é obrigatório") String name,
            @Email(message = "Informe um e-mail válido") String email,
            @Min(value = 18, message = "A idade mínima é 18") int age
    ) {}
}
