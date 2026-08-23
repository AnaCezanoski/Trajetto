# OB03 — Contrato de erro padronizado na API

Toda falha da API — de negócio, de validação, de segurança ou inesperada — é convertida em uma
resposta JSON com o **mesmo formato**, por um **ponto único de tratamento de exceções**.

## Formato da resposta

```json
{
  "timestamp": "2026-08-16T14:03:22.123-03:00",
  "status": 404,
  "error": "Not Found",
  "code": "RESOURCE_NOT_FOUND",
  "message": "Usuário não encontrado(a) para o identificador 42.",
  "path": "/user/42",
  "method": "GET",
  "traceId": "3f1c2b9e"
}
```

| Campo       | O que representa                                                                 |
|-------------|----------------------------------------------------------------------------------|
| `timestamp` | Momento da ocorrência (ISO-8601 com fuso).                                        |
| `status`    | Status HTTP numérico.                                                             |
| `error`     | Descrição padrão do status HTTP.                                                  |
| `code`      | **Identificação do erro** — valor estável, para o frontend reagir sem ler o texto. |
| `message`   | Mensagem legível, destinada ao usuário final.                                     |
| `path`      | **Origem** da falha (URI chamada).                                                |
| `method`    | Método HTTP da requisição.                                                        |
| `traceId`   | Correlação com o log do servidor.                                                 |
| `details`   | Só em erros de validação: lista de campos rejeitados.                             |

Erro de validação (`details` presente):

```json
{
  "timestamp": "2026-08-16T14:05:10.881-03:00",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Existem campos inválidos na requisição.",
  "path": "/user/create",
  "method": "POST",
  "traceId": "9ab2c110",
  "details": [
    { "field": "email",    "message": "Informe um e-mail válido",              "rejectedValue": "abc" },
    { "field": "password", "message": "A senha deve ter no mínimo 8 caracteres", "rejectedValue": "123" }
  ]
}
```

## Códigos de erro (`code`)

| `code`                    | HTTP | Quando ocorre                                              |
|---------------------------|------|------------------------------------------------------------|
| `VALIDATION_ERROR`        | 400  | Bean Validation reprovou campos do corpo ou dos parâmetros |
| `MALFORMED_REQUEST`       | 400  | JSON malformado ou incompatível                            |
| `INVALID_PARAMETER`       | 400  | Parâmetro ausente ou com tipo incompatível                 |
| `INVALID_CREDENTIALS`     | 401  | E-mail ou senha incorretos no login                        |
| `UNAUTHENTICATED`         | 401  | Requisição sem token em recurso protegido                  |
| `SESSION_EXPIRED`         | 401  | Token venceu — a sessão precisa ser refeita                |
| `INVALID_SESSION`         | 401  | Token corrompido, adulterado ou de outro emissor           |
| `ACCESS_DENIED`           | 403  | Usuário autenticado sem permissão para a operação          |
| `RESOURCE_NOT_FOUND`      | 404  | Recurso solicitado não existe                              |
| `ENDPOINT_NOT_FOUND`      | 404  | Rota inexistente                                           |
| `METHOD_NOT_ALLOWED`      | 405  | Método HTTP não suportado pela rota                        |
| `RESOURCE_CONFLICT`       | 409  | Duplicidade / conflito com os dados atuais                 |
| `UNSUPPORTED_MEDIA_TYPE`  | 415  | `Content-Type` não suportado                               |
| `BUSINESS_RULE_VIOLATION` | 422  | Requisição válida, porém barrada por regra de negócio      |
| `INTERNAL_ERROR`          | 500  | Falha inesperada (detalhes ficam apenas no log)            |
| `EXTERNAL_SERVICE_ERROR`  | 502  | Falha em serviço externo (Overpass, ORS, e-mail)           |

## Como está implementado

Pacote `com.trajetto.backend.exception`:

- **`ApiError`** — o contrato em si (record serializado para JSON).
- **`ApiErrorCode`** — enum que associa cada código ao seu status HTTP e mensagem padrão.
- **`ApiException`** e subclasses — exceções de negócio lançadas pelos services:
  - `ResourceNotFoundException` (404)
  - `ResourceConflictException` (409)
  - `BusinessRuleException` (422)
  - `ForbiddenOperationException` (403)
  - `InvalidRequestException` (400)
- **`GlobalExceptionHandler`** — `@RestControllerAdvice`: ponto único que converte qualquer
  exceção no contrato acima. Erros 5xx são logados com stack trace; 4xx, apenas como aviso.
  A mensagem original de um erro inesperado **não** é exposta ao cliente — o `traceId` da
  resposta permite localizá-la no log.
- **`ApiErrorResponseWriter`** + `JsonAuthenticationEntryPoint` / `JsonAccessDeniedHandler`
  (pacote `security`) — 401 e 403 acontecem na cadeia de filtros do Spring Security, antes do
  `DispatcherServlet`, e por isso são escritos diretamente na resposta usando o mesmo contrato.
- **`ApiErrorController`** — responde `/error`, para onde o container despacha o que falha fora
  dos controllers (em um filtro, ou via `response.sendError()`). Sem ele essas respostas sairiam
  no formato padrão do Spring Boot, diferente do resto da API.

### Como lançar um erro

Os controllers não usam `try/catch`: basta lançar a exceção adequada no service.

```java
UserModel user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));

if (existingUser.isVerified()) {
    throw new ResourceConflictException("Este e-mail já está em uso.");
}
```

### Como validar uma entrada

Anote o DTO com Bean Validation e o parâmetro do controller com `@Valid`; as violações viram
automaticamente uma resposta `VALIDATION_ERROR` com a lista de campos em `details`.

```java
@PostMapping("/create")
public ResponseEntity<List<UserResponseDTO>> createUser(@Valid @RequestBody UserDTO userDTO) { ... }
```

## Respostas de acesso negado e de sessão inválida

Falhas de segurança não passam pelo `GlobalExceptionHandler`: o Spring Security as resolve na
cadeia de filtros, antes do `DispatcherServlet`. Elas seguem o mesmo contrato mesmo assim, e o
`code` distingue o que o aplicativo deve fazer — não basta saber que deu 401.

| Situação                                              | `code`              | O que o app faz                       |
|-------------------------------------------------------|---------------------|---------------------------------------|
| Recurso protegido, requisição sem token                | `UNAUTHENTICATED`   | Pede login                            |
| Token venceu (48 h)                                    | `SESSION_EXPIRED`   | Descarta a sessão salva e pede login  |
| Token corrompido, adulterado ou de outro emissor       | `INVALID_SESSION`   | Descarta a sessão salva e pede login  |
| E-mail ou senha errados no `POST /user/login`          | `INVALID_CREDENTIALS` | Mostra o erro **sem** deslogar      |
| Autenticado, mas sem a permissão exigida pela rota     | `ACCESS_DENIED`     | Informa; entrar de novo não resolve   |

```json
{
  "timestamp": "2026-08-20T09:12:44.517-03:00",
  "status": 401,
  "error": "Unauthorized",
  "code": "SESSION_EXPIRED",
  "message": "Sua sessão expirou. Entre novamente para continuar.",
  "path": "/user/me",
  "method": "GET",
  "traceId": "1d7ea0c4"
}
```

Como funciona, do token à resposta:

1. `Jwt.extract` lê o cabeçalho `Authorization`. Sem cabeçalho, devolve `null` — requisição
   anônima, legítima nos endpoints públicos. Com um token que não vale, lança
   `InvalidSessionException` carregando `SESSION_EXPIRED` ou `INVALID_SESSION`.
2. `JwtTokenFilter` **não** responde na hora: anota o motivo na requisição e segue a cadeia.
   É o que permite ao aplicativo refazer o login carregando um token vencido — se o filtro
   cortasse ali, `POST /user/login` também morreria com 401.
3. Se o endpoint exigir autenticação, o `JsonAuthenticationEntryPoint` lê o motivo anotado e
   responde no contrato, com o código específico. Se o usuário estiver autenticado mas sem
   permissão, quem responde é o `JsonAccessDeniedHandler`, com 403.

Detalhes que a resposta **não** traz, de propósito: por que o token foi recusado (assinatura,
formato, emissor) e qual permissão faltava. Isso ajudaria quem estivesse sondando a API; fica
no log, alcançável pelo `traceId`.

Toda resposta 401 acompanha o cabeçalho `WWW-Authenticate`, como manda o HTTP:

```
WWW-Authenticate: Bearer realm="trajetto-api", error="invalid_token", error_description="The access token expired"
```

## Como o app consome o contrato

O helper `Repo-Front/Trajetto/utils/apiError.ts` lê a resposta de erro e devolve a mensagem
pronta para a tela — com fallback para falha de rede e para respostas fora do contrato:

```ts
import { getErrorMessage, getFieldErrors, getErrorCode } from '../utils/apiError';

try {
  await api.post('/user/create', dados);
} catch (e) {
  setErrors(getFieldErrors(e));                 // marca os inputs rejeitados
  Alert.alert('Erro', getErrorMessage(e));      // mostra a mensagem da API
}
```

| Função | Devolve |
|---|---|
| `getErrorMessage(erro, fallback?)` | Mensagem para o usuário; em validação, junta as mensagens de `details[]` |
| `getFieldErrors(erro)` | `{ email: 'Informe um e-mail válido' }` — encaixa direto no `setErrors` dos formulários |
| `getErrorCode(erro)` | O `code` do contrato, para a tela reagir sem depender do texto |
| `getErrorStatus(erro)` / `getTraceId(erro)` | Status HTTP e id para busca no log |
| `isSessionError(erro)` | `true` quando a sessão salva não vale mais — o `AuthContext` desloga por aqui |

## Testes

```bash
cd Repo-Back/backend
./mvnw test -Dtest='GlobalExceptionHandlerTest,ApiErrorResponseWriterTest,SecurityErrorContractTest,ApiErrorControllerTest'
```

- `GlobalExceptionHandlerTest` — verifica que falhas de negócio, de validação, de segurança e
  inesperadas saem todas no mesmo formato, com os status corretos.
- `ApiErrorResponseWriterTest` — verifica o mesmo contrato nos 401/403 do Spring Security.
- `SecurityErrorContractTest` — percorre o caminho real do token (filtro → entry point / access
  denied handler) com token ausente, vencido, adulterado, ilegível e de outro emissor.
- `ApiErrorControllerTest` — verifica o contrato no despacho interno para `/error`.
