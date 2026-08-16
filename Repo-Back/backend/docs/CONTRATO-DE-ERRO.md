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
| `UNAUTHENTICATED`         | 401  | Requisição sem token válido em recurso protegido           |
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

## Testes

```bash
cd Repo-Back/backend
./mvnw test -Dtest='GlobalExceptionHandlerTest,ApiErrorResponseWriterTest'
```

- `GlobalExceptionHandlerTest` — verifica que falhas de negócio, de validação, de segurança e
  inesperadas saem todas no mesmo formato, com os status corretos.
- `ApiErrorResponseWriterTest` — verifica o mesmo contrato nos 401/403 do Spring Security.
