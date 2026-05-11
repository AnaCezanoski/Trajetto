# Como adicionar um novo campo ao projeto Trajetto

Tutorial usando como exemplo o campo `nickname` (apelido) do tipo `String` no usuário.
Para trocar `nickname` por outro campo, substitua o nome em todos os arquivos listados abaixo.

---

## Arquivos que precisam ser alterados (7 no total)

```
BACKEND (Java)
├── UserModel.java          ← define a coluna no banco
├── UserDTO.java            ← recebe o campo no cadastro (POST)
├── UserResponseDTO.java    ← devolve o campo nas respostas da API
├── UserUpdateDTO.java      ← recebe o campo na edição de perfil (PUT)
├── DefaultUserFacade.java  ← mapeia os campos entre DTO ↔ Model
└── DefaultUserService.java ← copia o campo ao salvar no banco

FRONTEND (TypeScript)
├── types/user.ts           ← tipagem TypeScript
├── RegisterScreen.tsx      ← campo no formulário de cadastro
├── ProfileScreen.tsx       ← campo no formulário de edição de perfil
└── PerfilTabContent.tsx    ← exibe o campo na tela de perfil (opcional)
```

> O banco de dados **não precisa de migration manual**.
> `spring.jpa.hibernate.ddl-auto=update` faz o Hibernate criar a coluna
> automaticamente ao reiniciar o backend.

---

## PASSO 1 — Model (coluna no banco)

**Arquivo:**
[`Repo-Back/backend/src/main/java/com/trajetto/backend/user/model/UserModel.java`](Repo-Back/backend/src/main/java/com/trajetto/backend/user/model/UserModel.java)

Adicione junto aos outros campos da classe (ex: após `country`, por volta da linha 49):

```java
@Column(name = "nickname")
private String nickname;
```

---

## PASSO 2 — DTO de cadastro

**Arquivo:**
[`Repo-Back/backend/src/main/java/com/trajetto/backend/user/dto/UserDTO.java`](Repo-Back/backend/src/main/java/com/trajetto/backend/user/dto/UserDTO.java)

Adicione o campo na classe (por volta da linha 19):

```java
private String nickname;
```

---

## PASSO 3 — DTO de resposta da API

**Arquivo:**
[`Repo-Back/backend/src/main/java/com/trajetto/backend/user/dto/UserResponseDTO.java`](Repo-Back/backend/src/main/java/com/trajetto/backend/user/dto/UserResponseDTO.java)

Adicione o campo na classe (por volta da linha 19):

```java
private String nickname;
```

> Sem isso o campo existe no banco mas nunca chega ao frontend.

---

## PASSO 4 — DTO de edição de perfil

**Arquivo:**
[`Repo-Back/backend/src/main/java/com/trajetto/backend/user/dto/UserUpdateDTO.java`](Repo-Back/backend/src/main/java/com/trajetto/backend/user/dto/UserUpdateDTO.java)

Adicione o campo na classe (por volta da linha 17):

```java
private String nickname;
```

> A anotação `@JsonInclude(NON_NULL)` já garante que campos não enviados
> pelo frontend não sobrescrevam o valor existente no banco.

---

## PASSO 5 — Facade (mapeamento DTO ↔ Model)

**Arquivo:**
[`Repo-Back/backend/src/main/java/com/trajetto/backend/user/facade/impl/DefaultUserFacade.java`](Repo-Back/backend/src/main/java/com/trajetto/backend/user/facade/impl/DefaultUserFacade.java)

Adicione o setter em **3 lugares** dentro desse arquivo:

### 5a — `fromDto` (linha ~54, cria UserModel a partir de UserDTO)
```java
target.setNickname(source.getNickname());
```

### 5b — `populateUserModel` (linha ~69, atualiza UserModel a partir de UserDTO)
```java
target.setNickname(source.getNickname());
```

### 5c — `populateUserResponseDTO` (linha ~93, preenche a resposta da API)
```java
target.setNickname(source.getNickname());
```

### 5d — `updateUserProfile` (linha ~178, aplica as edições do perfil)
```java
if (dto.getNickname() != null) user.setNickname(dto.getNickname());
```

---

## PASSO 6 — Service (persistência no banco)

**Arquivo:**
[`Repo-Back/backend/src/main/java/com/trajetto/backend/user/service/impl/DefaultUserService.java`](Repo-Back/backend/src/main/java/com/trajetto/backend/user/service/impl/DefaultUserService.java)

No método `updateUser` (linha ~80), adicione junto aos outros setters:

```java
existingUser.setNickname(userModel.getNickname());
```

> Este método copia explicitamente cada campo do `userModel` para o
> `existingUser` antes de salvar. Se o campo não estiver aqui, ele é
> ignorado mesmo que já tenha sido setado no Facade.

---

## PASSO 7 — Tipagem TypeScript

**Arquivo:**
[`Repo-Front/Trajetto/types/user.ts`](Repo-Front/Trajetto/types/user.ts)

Adicione em `User` (campo nullable, linha ~10):
```typescript
nickname: string | null;
```

Se o campo puder ser enviado no cadastro, adicione também em `RegisterRequest` (opcional com `?`):
```typescript
nickname?: string;
```

---

## PASSO 8 — Formulário de cadastro (frontend)

**Arquivo:**
[`Repo-Front/Trajetto/app/RegisterScreen.tsx`](Repo-Front/Trajetto/app/RegisterScreen.tsx)

**8a** — Adicione o estado (linha ~42, junto aos outros `useState`):
```tsx
const [nickname, setNickname] = useState('');
```

**8b** — Inclua no objeto enviado à API dentro de `handleRegister` (linha ~59):
```tsx
nickname: nickname || undefined
```

**8c** — Adicione o campo visual no formulário (dentro do `<View style={styles.card}>`):
```tsx
<Field label="Apelido (Nickname)">
  <TextInput
    style={styles.input}
    placeholder="Como quer ser chamado?"
    placeholderTextColor={PLACEHOLDER}
    value={nickname}
    onChangeText={setNickname}
    autoCapitalize="none"
  />
</Field>
```

---

## PASSO 9 — Formulário de edição de perfil (frontend)

**Arquivo:**
[`Repo-Front/Trajetto/app/ProfileScreen.tsx`](Repo-Front/Trajetto/app/ProfileScreen.tsx)

**9a** — Adicione o estado (linha ~36):
```tsx
const [nickname, setNickname] = useState('');
```

**9b** — Carregue o valor ao buscar o perfil, dentro do `useEffect` (linha ~50):
```tsx
setNickname(u.nickname ?? '');
```

**9c** — Inclua no objeto enviado à API dentro de `handleUpdate` (linha ~65):
```tsx
nickname: nickname || undefined
```

**9d** — Adicione o campo visual no formulário:
```tsx
<Field label="Apelido (Nickname)">
  <TextInput
    style={styles.input}
    placeholder="Como quer ser chamado?"
    placeholderTextColor={PLACEHOLDER}
    value={nickname}
    onChangeText={setNickname}
    autoCapitalize="none"
  />
</Field>
```

---

## PASSO 10 — Exibir na tela de perfil (opcional)

**Arquivo:**
[`Repo-Front/Trajetto/components/PerfilTabContent.tsx`](Repo-Front/Trajetto/components/PerfilTabContent.tsx)

Adicione após o e-mail na seção hero (linha ~80):
```tsx
{user?.nickname && (
  <Text style={styles.userNickname}>@{user.nickname}</Text>
)}
```

Adicione o estilo no `StyleSheet`:
```tsx
userNickname: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
```

---

## Resumo

| # | Arquivo | Onde mudar |
|---|---------|------------|
| 1 | `UserModel.java` | Adicionar `@Column` + campo privado |
| 2 | `UserDTO.java` | Adicionar campo privado |
| 3 | `UserResponseDTO.java` | Adicionar campo privado |
| 4 | `UserUpdateDTO.java` | Adicionar campo privado |
| 5 | `DefaultUserFacade.java` | 4 setters: `fromDto`, `populateUserModel`, `populateUserResponseDTO`, `updateUserProfile` |
| 6 | `DefaultUserService.java` | Setter em `updateUser` |
| 7 | `types/user.ts` | Campo na interface `User` (e `RegisterRequest` se necessário) |
| 8 | `RegisterScreen.tsx` | Estado + envio + campo visual |
| 9 | `ProfileScreen.tsx` | Estado + carga + envio + campo visual |
| 10 | `PerfilTabContent.tsx` | Exibir valor (opcional) |

---

## Rodando o projeto

**Backend:**
```bash
cd Repo-Back/backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd Repo-Front/Trajetto
npx expo start
```
