# Trajetto

Plataforma mobile para descoberta e planejamento de roteiros turísticos personalizados.

# Sobre o Projeto

O **Trajetto** é um aplicativo desenvolvido para ajudar usuários a **descobrir, planejar e organizar roteiros turísticos personalizados** de forma simples e intuitiva.

A aplicação permite que usuários encontrem pontos turísticos, criem itinerários, visualizem recomendações e planejem suas viagens de maneira eficiente.

O projeto está sendo desenvolvido como **Trabalho de Conclusão de Curso (TCC)** no curso de **Sistemas de Informação**.

## Equipe
Projeto desenvolvido por:

Ana Julia Rocha Cezanoski
Eduardo Nicolosi de Oliveira
Kauane Santana da Rosa
Lucas Nascimento da Silva

# Objetivos

- Facilitar o planejamento de viagens e roteiros turísticos
- Centralizar informações sobre pontos turísticos
- Permitir a criação de **roteiros personalizados**
- Melhorar a experiência do usuário ao explorar novos destinos
- Utilizar tecnologias modernas para desenvolvimento mobile

# Funcionalidades

- Cadastro de usuário
- Login no sistema
- Gerenciamento de perfil
- Visualização de pontos turísticos
- Busca por destinos
- Criação de roteiros turísticos personalizados
- Edição e exclusão de roteiros
- Favoritar locais
- Visualização de rotas no mapa
- Gerenciar usuários
- Gerenciar pontos turísticos
- Moderar conteúdos
- Gerenciar dados da plataforma

# Requisitos Funcionais

- RF01 – Realizar login no sistema  
- RF02 – Realizar CRUD dos usuários  
- RF03 – Realizar teste de perfil de viajante  
- RF04 – Gerar roteiro da viagem com base no perfil  
- RF05 – Avaliar roteiro gerado  
- RF06 – Visualizar mapa e itinerário do roteiro  
- RF07 – Filtrar pontos turísticos por critérios avançados  
- RF08 – Avaliar os pontos turísticos visitados  
- RF09 – Recalcular roteiros em tempo real  
- RF10 – Adicionar notas/observações pessoais ao roteiro  
- RF11 – Sugerir novos pontos de interesse para o sistema
- RF12 – Exportar/Compartilhar roteiro
- RF13 – Acessar/Consultar histórico de roteiros
- RF14 – Gerenciar pontos turísticos
- RF15 – Gerar estatísticas de uso/viagem
- RF16 – Visualizar dashboards de uso

# Arquitetura do Sistema

O sistema segue uma arquitetura **cliente-servidor**, composta por:

- Aplicação Mobile
- API Backend
- Banco de Dados

# Tecnologias Utilizadas

## Frontend
- React Native
- JavaScript / TypeScript
- Axios
- React Navigation

## Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- REST API

## Banco de Dados
- MySQL

## Ferramentas
- Git
- GitHub
- Postman
- Figma
- Trello

# Estrutura do Projeto


---

# Como Executar o Projeto

## FRONTEND

Antes de começar, você precisa ter instalado:

### 1. Node.js

* Baixe em: https://nodejs.org
* Instale o Node.js (versão 18 ou superior recomendada)

### 2. Verificar instalação

Após instalar, abra o terminal e execute:

```bash
node -v
npm -v
```

Se aparecerem versões (ex: `v18.x.x`), está tudo certo ✅

## 📦 Instalar dependências

```bash
npm install
```

## ▶️ Rodar o projeto

```bash
npx expo start
```

Isso abrirá uma página no navegador com um QR Code.

## 📱 Rodar no celular

1. Instale o aplicativo **Expo Go**:

   * Android: Play Store
   * iOS: App Store

2. Conecte seu celular na mesma rede Wi-Fi do computador

3. Abra o **Expo Go** e escaneie o QR Code exibido no navegador

## 💻 Rodar no emulador (opcional)

Caso tenha um emulador configurado:

* Pressione `a` para abrir no Android
* Pressione `i` para abrir no iOS (apenas Mac)

---

## BACKEND

## Pré-requisitos
- Node.js
- Java JDK 17+
- MySQL
- Git
- Android Studio ou Expo

## Clonar o repositório

```bash
git clone https://github.com/AnaCezanoski/Trajetto.git
cd Trajetto
```
## Executar o Backend

```bash
cd backend
./mvnw spring-boot:run
```
## O servidor iniciará em
```bash
http://localhost:8080
```

## Executar o Mobile
```bash
cd mobile
npm install
npm start
```
