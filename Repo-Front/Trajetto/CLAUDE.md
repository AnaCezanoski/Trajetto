# CLAUDE.md - Coding Profile

# Stack: TypeScript, React Native + Expo, Expo Router (roteamento file-based em `app/`)

---

## Output

- Retorne o código antes. Explicação depois, somente se não for óbvia.
- Sem comentarios inline. Sem boilerplate nao solicitado.
- Sem features especulativas ou "voce tambem pode querer...".
- Sem narrar etapas antes de executar. Sem texto entre tool calls.

## Code Rules

- Solucao mais simples. Sem over-engineering.
- Sem abstractions para uso unico.
- Nao toque codigo fora do escopo. Se ver bug adjacente: mencione em uma linha, nao implemente.
- Confirme antes apenas de mudancas destrutivas ou irreversiveis.
- Sem console.log de debug no codigo retornado.

## Review Rules

- Aponte o problema. Mostre o fix. Pare.
- Sem sugestoes fora do escopo. Sem elogios ao codigo.

## ASCII

- Sem em dashes, aspas tipograficas ou bullets Unicode.
- Codigo deve ser copy-paste safe.

## Skills

Use a skill correspondente sempre que a tarefa se encaixar, sem precisar que o usuario peca explicitamente pelo nome dela.

| Skill | Quando usar |
|---|---|
| `refatorar` | Pedido para refatorar uma tela/componente existente, ou para seguir o padrao do projeto (separacao UI/hook/styles, componentes existentes) ao mexer em algo. |
| `feature` | Pedido para criar uma feature nova do zero (aplica as regras de `refatorar` como base). |
| `mockar` | Pedido para criar ou remover mock de tela/dados. |
| `worktree` | Pedido de feature nova, edicao ou correcao de bug **acompanhado de uma branch de referencia** para criar a branch de trabalho a partir dela. Tambem usada quando o usuario pede comandos git diretos, como commitar ou dar push. |
| `testar` | Pedido para escrever, rodar ou revisar testes automatizados (Jest/RNTL) de hook, tela ou fluxo de navegacao. |
| `atualizar-libs` | Pedido para atualizar/corrigir uma dependencia com bug ou incompatibilidade. Segue a ordem versao -> patch -> troca de lib, e para pra confirmar antes de substituir uma biblioteca. |

Se o local (`.claude/commands/<skill>.md`) nao existir na branch atual, usar a versao global em `~/.claude/commands/<skill>.md`.

## Commits

1. Ask: "Autorizo o commit? (sim/nao)" — wait for confirmation before running.
2. NEVER include "Co-Authored-By" or any Claude/AI attribution in commit messages.

## Error Loop

Se o mesmo erro, falha de teste, ou abordagem falhar 3 vezes seguidas, PARE imediatamente. Nao tente uma 4a correcao sozinho. Explique o que foi tentado e por que falhou, depois pergunte ao usuario como proceder. Vale para qualquer agent/subagent (thread principal, subagents disparados via `Agent` tool, correcoes aplicadas pelo subagent `revisao-linha-a-linha`, tentativas de build/run como `expo start`/`expo run:android`/`expo run:ios`).
