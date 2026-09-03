# Arquitetura do frontend (Trajetto)

Este documento registra os padroes de projeto e as decisoes de arquitetura adotados no
frontend (Expo + Expo Router), pra quem for mexer no codigo depois entender o porque das
camadas existirem e onde cada tipo de codigo deve morar.

## Camadas

```
app/                          rotas do Expo Router — wrapper de 1 linha por tela
  LoginScreen.tsx              export { default } from '@/src/pages/common/login/Login';

src/pages/<dominio>/<Tela>/    implementacao real de cada tela
  Tela.tsx                     UI pura — so JSX. Sem estado, sem chamada de API.
  hooks/use<Coisa>.ts          estado, efeitos, orquestracao (fetch -> aplica regra -> guarda estado)
  styles/styles.ts             (colors) => StyleSheet.create({...})
  components/                  componentes usados so por essa tela

src/domain/                    regras de negocio puras, sem React e sem rede
  alternatives/selectAlternatives.ts
  quiz/applyAnswerScore.ts

services/                      UNICA camada que fala com o backend (axios/api)
  api.ts, authService.ts, userService.ts, placesService.ts, itineraryService.ts, ...

components/ e src/components/  biblioteca de UI compartilhada entre telas
  CustomButton, CustomInput, AsyncState, CountryPickerModal, PasswordStrength, ...

src/theme/                     design tokens (cores, paleta de graficos)

hooks/                         estado global compartilhado entre telas (zustand)
  itineraryStore.ts
```

## Padroes de projeto adotados

- **Separacao UI / estado / estilo (Container-Presentational)** — cada tela e um trio
  `Tela.tsx` (apresentacao) + `hooks/use*.ts` (estado e orquestracao) + `styles/styles.ts`
  (estilo). O componente de UI nunca chama `fetch`/`api`/`services` diretamente; ele so
  recebe dados e callbacks do hook. Isso mantem a tela facil de ler e o hook testavel sem
  precisar renderizar nada.

- **Service Layer (Facade)** — `services/` e o unico ponto de contato com o backend. Nenhuma
  tela, componente, contexto ou hook importa `axios` ou o cliente HTTP (`services/api.ts`)
  diretamente; eles importam a funcao/service correspondente. Essa regra e imposta por
  lint (`no-restricted-imports` em `eslint.config.js`, cobrindo `app/`, `components/`,
  `context/`, `hooks/` e `src/`) e verificada por um teste de arquitetura
  (`npm run test:arquitetura`, em `scripts/teste-arquitetura.js`), que prova que um arquivo
  que tenta furar a regra (`tests/arquitetura/teste-acesso-direto-a-api.ts`) e reprovado
  pelo lint. Trocar a lib HTTP ou mudar a URL base do backend afeta so `services/`.

- **Camada de dominio (funcoes puras)** — regras de negocio que nao sao so "buscar dado e
  mostrar" ficam em `src/domain/`, como funcoes puras que recebem dados prontos e devolvem
  um resultado, sem depender de React nem de rede:
  - `selectAlternatives` (`src/domain/alternatives/`): escolhe os lugares alternativos ao
    trocar uma parada do roteiro (2 da mesma categoria + 1 diferente, com fallback).
  - `applyAnswerScore` (`src/domain/quiz/`): aplica a pontuacao de uma resposta do teste de
    perfil de viajante aos scores acumulados.
  Os hooks (`useAlternatives`, `useQuiz`) chamam essas funcoes em vez de calcular a regra
  inline — o hook cuida so de buscar o dado e guardar o resultado no estado. Validacoes de
  formulario (`utils/validators.ts`) e o calculo do perfil do quiz (`data/quizData.ts::calcularPerfil`)
  ja seguiam essa ideia antes desta rodada.

- **Componente reutilizavel de estado assincrono** — `AsyncState`
  (`src/components/AsyncState/`) unifica loading (spinner + mensagem), erro (icone + texto
  + botao de retry) e vazio (icone + titulo + descricao) num unico componente. Toda tela
  que busca dado do backend usa esse componente em vez de reimplementar o proprio bloco de
  `ActivityIndicator`/texto de erro/botao "Tentar novamente" — hoje: `AdminPanel`,
  `Dashboard`, `UserList`, `Profile`, `Explore`, `Itinerario`.

- **Design tokens** — `src/theme/colors.ts` centraliza a paleta (cores de marca, estados,
  superficies). Nenhum componente usa hex direto no `style`; tudo referencia `colors.*` (ou
  `chartColors`/`adminAccent`, a paleta separada dos graficos do painel admin).

- **Store global (Zustand)** — estado compartilhado entre telas que nao faz sentido
  refazer fetch a cada navegacao (ex: o roteiro ativo do usuario) fica em `hooks/*Store.ts`
  (`itineraryStore.ts`), consumido pelas telas via hook, nao via prop-drilling.

## Regra de dependencia

```
app/            -> so re-exporta de src/pages/
src/pages/*/    -> components/, src/components/, services/, src/domain/, src/theme/, hooks/*Store
src/domain/     -> nada de React, nada de rede — so tipos e funcoes puras
services/       -> so api.ts (cliente HTTP) e tipos de dominio da API
```

Nada fora de `services/` importa `axios` ou `services/api`; nada em `src/domain/` importa
`react`/`react-native` ou `services/`.

## O que isso NAO e

Pra ser honesto sobre o alcance: isso **nao e Clean Architecture completa** (Robert C.
Martin) no sentido estrito. Nao existe uma camada explicita de casos de uso/interactors
nem uma interface de repositorio abstraindo `services/` — os hooks de tela ainda misturam
"buscar dado" com "orquestrar estado da tela", so a regra de negocio pesada (quando existe)
foi extraida pra `src/domain/`. O que existe hoje e:

- separacao de responsabilidades (apresentacao / estado / estilo / regra de negocio / acesso
  a rede) em camadas identificaveis,
- baixo acoplamento entre elas (a tela nao sabe como o dado chega; o service nao sabe quem
  o chama; o dominio nao sabe que existe UI),
- e alta coesao dentro de cada arquivo (cada um faz uma coisa).

Isso cobre os principios que a arquitetura em camadas busca, sem forcar a estrutura completa
de Clean Architecture (que teria camadas adicionais de entidades/casos de uso/adapters) num
app deste tamanho.

## Limitacoes conhecidas

- `src/domain/` cobre so as duas regras de negocio identificadas como nao-triviais ate
  agora (selecao de alternativas, pontuacao do quiz). Outros hooks ainda tem logica de
  orquestracao que poderia crescer a ponto de merecer extracao (ex: `useMapaLocation`,
  que monta os segmentos de rota).
- Nao ha testes automatizados (unitarios) para os hooks nem para `src/domain/` ainda — so o
  teste de arquitetura (`npm run test:arquitetura`), que cobre exclusivamente a regra de
  "nenhuma tela fala direto com o backend".
