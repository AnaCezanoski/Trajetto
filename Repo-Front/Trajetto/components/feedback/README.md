# Padrão de carregamento, erro e vazio

Toda tela que busca dados passa pelas mesmas quatro situações: está buscando, falhou, não veio
nada, ou veio conteúdo. Antes, cada tela resolvia isso do seu jeito — um spinner aqui, um alerta
ali, uma lista em branco sem explicação acolá. Agora existe um lugar só.

## Como uma tela usa

```tsx
import { AsyncBoundary, useAsyncData } from '../components/feedback';

const usuarios = useAsyncData(() => userService.getAll());

<AsyncBoundary
  state={usuarios}
  onRetry={usuarios.reload}
  empty={{ title: 'Nenhum usuário cadastrado', message: 'Assim que alguém criar uma conta, aparece aqui.' }}
>
  {(lista) => <FlatList data={lista} ... />}
</AsyncBoundary>
```

A tela diz **o que buscar** e **o que desenhar quando há conteúdo**. O resto — decidir qual aviso
mostrar, escrever a mensagem que orienta o usuário e oferecer o botão que tira ele da situação —
é do padrão.

## Como está dividido

| Arquivo | Responsabilidade |
| --- | --- |
| `feedbackStatus.ts` | A regra: dado o estado da busca, qual aviso aparece. Não sabe o que é tela. |
| `useAsyncData.ts` | O estado: buscar, guardar o resultado, guardar a falha, refazer. Não sabe o que é aparência. |
| `FeedbackState.tsx` | A aparência: símbolo, título, mensagem orientativa e ação de recuperação. Não sabe o que é busca. |
| `AsyncBoundary.tsx` | A ligação entre as três coisas acima. |
| `index.ts` | A porta de entrada. Telas importam daqui e não conhecem o que tem dentro. |

Cada peça pode mudar sem obrigar as outras a mudar: trocar o visual dos avisos não mexe na regra,
e mudar a regra não mexe em nenhuma tela.

## Onde já está em uso

- **Lista de usuários** (`app/UserListScreen.tsx`) — tela piloto, com os três estados.
- **Dashboard** (`app/DashboardScreen.tsx`) — trocou o carregando e o erro que tinha só para ela.

## Como conferir

```bash
npm run test:feedback   # prova que o aviso certo aparece em cada situação
npm run web             # e abra /DemoFeedbackScreen para ver os três estados na mão
```
