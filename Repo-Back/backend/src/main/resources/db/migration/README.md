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

## Recriando o banco do zero

```sql
DROP DATABASE IF EXISTS trajetto;
```

Na próxima vez que o backend subir, o banco é recriado e todas as migrações são
aplicadas na sequência.
