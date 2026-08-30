# Migrações de banco de dados!

O esquema do banco do Trajetto é versionado com **Flyway**. A aplicação não cria
nem altera tabelas: ela apenas confere, na inicialização, se o banco está de
acordo com as entidades (`spring.jpa.hibernate.ddl-auto=validate`).

Toda alteração de estrutura entra aqui como um arquivo novo, revisado junto com
o código que depende dela.

## Como funciona

Ao subir o backend, o Flyway lê os arquivos desta pasta e aplica, em ordem, os
que ainda não foram executados naquele banco. O controle fica na tabela
`flyway_schema_history`, criada automaticamente.

- **Banco vazio**: o Flyway aplica desde o `V1` e monta o esquema completo. Não
  há nenhum passo manual — basta ter o MySQL rodando.
- **Banco que já existia antes do Flyway**: o `V1` é apenas o retrato do que já
  estava lá, então o Flyway registra o banco como já estando na versão 1
  (`spring.flyway.baseline-on-migrate=true`) e segue a partir do `V2`.

## Criando uma nova migração

1. Crie um arquivo nesta pasta seguindo o padrão:

   ```
   V<numero>__<descricao_em_snake_case>.sql
   ```

   Exemplos: `V2__add_indice_email_usuario.sql`, `V3__cria_tabela_favoritos.sql`

   O número deve ser o próximo livre. Repare no **duplo underscore** entre o
   número e a descrição.

2. Escreva o SQL da alteração. Se a mudança mexe em entidades JPA, ajuste as
   classes na mesma alteração — a aplicação valida as duas pontas ao subir.

3. Suba o backend localmente para conferir que a migração aplica e que a
   validação passa.

## Regras

- **Nunca edite uma migração já aplicada.** O Flyway guarda um checksum de cada
  arquivo e recusa subir se um arquivo antigo mudou. Correção de algo já
  entregue vira uma migração nova.
- **Uma migração por alteração de esquema**, com nome que diga o que ela faz.
- **Não volte o `ddl-auto` para `update`.** Isso reabriria a porta para o banco
  mudar sozinho, sem histórico e sem revisão.

## O que já está versionado

| Versão | O que faz |
| ------ | --------- |
| `V1` | Retrato do esquema que a aplicação criava sozinha antes do Flyway. |
| `V2` | Índices dos indicadores do painel: os `UNIQUE` que passam a garantir no banco que um e-mail pertence a um usuário só e que um usuário avalia um local uma vez só, mais os índices comuns nas colunas que o painel agrupa. |
| `V3` | `sp_stats_user_overview`, a *stored procedure* que devolve em uma linha os sete indicadores de usuários do painel. |
| `V4` | Índices de roteiros e locais: os `UNIQUE` que passam a garantir no banco que um usuário tem no máximo um roteiro ativo e que cada posição de um roteiro é ocupada por um local só, mais a troca de três índices da `V2` por formas que as consultas do painel conseguem usar. |
| `V5` | `sp_stats_itinerary_overview`, contraparte da `V3` para os cartões de roteiros. |

A `V2` limpa duplicatas antes de criar cada `UNIQUE`: e-mail repetido faz a
conta mais antiga manter o endereço e as demais receberem o sufixo
`.dup<code>`; avaliação repetida do mesmo usuário no mesmo local mantém a
primeira e descarta as outras. Em banco íntegro esse passo não altera
nenhuma linha.

A `V3` e a `V5` criam rotinas, então o usuário do banco precisa do privilégio
`CREATE ROUTINE`. Com o `root` do ambiente local e do CI isso já vale; num
banco gerenciado, confira antes de subir.

A `V4` também limpa antes de criar cada `UNIQUE`: com mais de um roteiro ativo
no mesmo usuário, o mais recente continua ativo e os outros só perdem a marca
(nenhum roteiro é apagado); com duas paradas na mesma posição de um roteiro, a
mais antiga fica. Em banco íntegro nenhum dos dois passos altera uma linha
sequer — nenhum caminho do código de hoje cria essas duplicatas de propósito,
elas só apareceriam por corrida entre requisições simultâneas.

Ela usa dois recursos do MySQL 8 que valem uma nota. O `UNIQUE` de roteiro
ativo é sobre uma **coluna gerada** (`active_user_id`), que vale `user_id`
enquanto o roteiro está ativo e `NULL` quando não está: como índice `UNIQUE`
não compara `NULL`s entre si, o efeito é um `UNIQUE` que enxerga só as linhas
ativas. E `idx_places_category_label` é um **índice funcional**, sobre a
expressão que `/stats/places-by-category` agrupa — um índice comum sobre
`category` não serve para agrupar por expressão.

## Recriando o banco do zero

```sql
DROP DATABASE IF EXISTS trajetto;
```

Na próxima vez que o backend subir, o banco é recriado e todas as migrações são
aplicadas na sequência.
