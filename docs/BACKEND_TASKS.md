# Lootbook Backend Tasks

## 1. Objetivo

Este documento converte a arquitetura do backend em uma lista de tasks executaveis.

O foco aqui e:
- ordem correta de implementacao
- detalhamento do que sera feito
- motivo de cada etapa existir
- dependencias entre tasks
- definicao de pronto por bloco

Stack travada:
- Fastify
- Prisma
- PostgreSQL via Supabase
- Supabase Auth

## 2. Regra de execucao

O backend **nao deve comecar por rota, controller ou tela**.

O trabalho deve comecar pela modelagem do dominio no banco, porque isso trava o vocabulario do sistema:
- character
- stat
- resource
- item
- action
- effect
- link
- snapshot

Se essa base estiver errada:
- a API nasce errada
- o frontend consome payload errado
- os vinculos e automacoes ficam instaveis

## 2.1 Regra obrigatoria de migrations

Toda nova migration deve seguir esta convencao de nome:

`M{numero sequencial}-{descricao-curta}`

Exemplos:
- `M01-criacao-character-template`
- `M02-criacao-character-base`
- `M03-criacao-character-stats-resources`

Regras:
- sempre usar prefixo `M`
- sempre usar numero sequencial com dois digitos no inicio
- sempre usar descricao curta e objetiva
- sempre usar kebab-case
- a descricao deve dizer claramente o que a migration cria ou altera

Motivo:
- manter historico legivel
- facilitar rastreabilidade
- evitar migrations com nomes genericos ou confusos

## 3. Ordem validada de execucao

Ordem correta:

1. Task 1 - Modelagem do dominio e banco
2. Task 2 - Scaffold tecnico do backend
3. Task 3 - Autenticacao e ownership
4. Task 4 - Nucleo da ficha
5. Task 5 - Inventario, actions e effects
6. Task 6 - Links e automacoes
7. Task 7 - Ficha agregada e snapshots
8. Task 8 - Testes e endurecimento

Essa ordem esta correta e nao deve ser invertida.

Motivo:
- Task 1 define o schema
- Task 2 sobe a base tecnica em cima do schema
- Task 3 define ownership antes do CRUD real
- Task 4 cria a ficha minima funcional
- Task 5 adiciona entidades jogaveis
- Task 6 cria automacao quando os alvos ja existem
- Task 7 cria a leitura principal para o frontend
- Task 8 fecha consistencia, seguranca e qualidade

## 4. Task 1 - Modelagem do dominio e banco

### Motivo

Essa task vem primeiro porque define a linguagem do produto no backend e no banco.

Sem ela, todo o resto vira implementacao em cima de suposicoes.

### Resultado esperado

- schema inicial do Prisma
- entidades centrais da ficha modeladas
- ownership por usuario definido
- estado base e derivado separados conceitualmente
- primeira migration pronta para ser gerada

### Dependencias

- nenhuma

### Subtasks

#### 1.1 Criar a estrutura inicial do Prisma

O que fazer:
- criar `backend/prisma/schema.prisma`
- criar `backend/.env.example`
- configurar `datasource db`
- configurar `generator client`

Como fazer:
- apontar datasource para PostgreSQL
- preparar leitura de `DATABASE_URL`

Pronto quando:
- arquivo do schema existe
- `.env.example` do backend existe
- Prisma reconhece datasource e generator

#### 1.2 Definir a entidade `User`

O que fazer:
- modelar usuario interno do sistema

Campos minimos:
- `id`
- `authProviderId`
- `email`
- `displayName`
- `createdAt`
- `updatedAt`

Motivo:
- ownership da ficha depende disso
- Supabase Auth precisa de uma ancora interna

Pronto quando:
- `User` esta modelado e pronto para relacoes

#### 1.3 Definir a entidade `CharacterTemplate`

O que fazer:
- modelar templates de ficha

Campos minimos:
- `id`
- `key`
- `name`
- `description`
- `systemFamily`
- `isOfficial`
- `configJson`
- `createdAt`
- `updatedAt`

Motivo:
- o produto sera template-driven
- o core nao pode depender de um sistema fixo

Pronto quando:
- template existe como entidade separada

#### 1.4 Definir a entidade `Character`

O que fazer:
- modelar o agregado principal da ficha

Campos minimos:
- `id`
- `userId`
- `templateId`
- `name`
- `level`
- `status`
- `portraitUrl`
- `summaryJson`
- `createdAt`
- `updatedAt`

Motivo:
- tudo da ficha vai depender desta entidade

Pronto quando:
- personagem esta ligado ao usuario
- personagem pode opcionalmente referenciar template

#### 1.5 Definir a entidade `CharacterStat`

O que fazer:
- modelar atributos e stats numericos relevantes

Campos minimos:
- `id`
- `characterId`
- `key`
- `label`
- `baseValue`
- `currentValue`
- `maxValue`
- `metaJson`
- `createdAt`
- `updatedAt`

Motivo:
- stats precisam ser modelados de forma estruturada
- nao devem ficar misturados com resources

Pronto quando:
- stat esta ligado a um personagem
- suporta valor base e variacao

#### 1.6 Definir a entidade `CharacterResource`

O que fazer:
- modelar recursos rastreaveis da ficha

Campos minimos:
- `id`
- `characterId`
- `key`
- `label`
- `currentValue`
- `maxValue`
- `resetRule`
- `metaJson`
- `createdAt`
- `updatedAt`

Motivo:
- HP, mana, cargas e usos nao devem ser tratados como stat generico

Pronto quando:
- resource esta separado de stat
- suporta valores atual e maximo

#### 1.7 Definir a entidade `CharacterItem`

O que fazer:
- modelar inventario e equipamentos

Campos minimos:
- `id`
- `characterId`
- `name`
- `type`
- `equipped`
- `quantity`
- `weight`
- `metaJson`
- `createdAt`
- `updatedAt`

Motivo:
- itens serao alvos e fontes de links

Pronto quando:
- item suporta inventario livre e campos estruturados

#### 1.8 Definir a entidade `CharacterAction`

O que fazer:
- modelar ataques, poderes, magias e acoes

Campos minimos:
- `id`
- `characterId`
- `name`
- `actionType`
- `costJson`
- `rollJson`
- `damageJson`
- `metaJson`
- `createdAt`
- `updatedAt`

Motivo:
- acoes precisam existir como entidade propria para vinculos e automacoes

Pronto quando:
- action suporta custos, dano e dados variaveis

#### 1.9 Definir a entidade `CharacterEffect`

O que fazer:
- modelar efeitos ativos e passivos

Campos minimos:
- `id`
- `characterId`
- `sourceType`
- `sourceLabel`
- `effectType`
- `payloadJson`
- `active`
- `createdAt`
- `updatedAt`

Motivo:
- efeitos participam de modificacoes de estado

Pronto quando:
- effect pode ser persistido como estrutura de dados

#### 1.10 Definir a entidade `CharacterLink`

O que fazer:
- modelar vinculos entre entidades da ficha

Campos minimos:
- `id`
- `characterId`
- `sourceType`
- `sourceId`
- `targetType`
- `targetId`
- `operation`
- `configJson`
- `createdAt`
- `updatedAt`

Motivo:
- esta e a base do motor de automacao

Pronto quando:
- links conseguem referenciar origem, alvo e operacao

#### 1.11 Definir `CharacterNote` e `CharacterSnapshot`

O que fazer:
- modelar notas livres
- modelar snapshot de estado derivado

Campos minimos de `CharacterNote`:
- `id`
- `characterId`
- `section`
- `content`
- `createdAt`
- `updatedAt`

Campos minimos de `CharacterSnapshot`:
- `id`
- `characterId`
- `version`
- `derivedStateJson`
- `createdAt`

Motivo:
- notes sustentam a ficha livre
- snapshots sustentam leitura historica/derivada

Pronto quando:
- ambas as entidades estao ligadas a personagem

#### 1.12 Definir relacoes, indices e padroes comuns

O que fazer:
- revisar todas as relacoes
- adicionar indices
- padronizar timestamps e nomes

Indices minimos:
- `characters.userId`
- `characters.templateId`
- `characterStats.characterId`
- `characterResources.characterId`
- `characterItems.characterId`
- `characterActions.characterId`
- `characterEffects.characterId`
- `characterLinks.characterId`
- `characterSnapshots.characterId`

Motivo:
- preparar leitura e mutacao eficiente

Pronto quando:
- schema esta coerente e indexado

#### 1.13 Gerar a migration inicial

O que fazer:
- gerar migration base do Prisma
- usar a convencao `M01-...`

Motivo:
- congelar a primeira versao do banco

Pronto quando:
- migration gera sem erro
- schema Prisma valida
- nome da migration segue o padrao oficial

## 5. Task 2 - Scaffold tecnico do backend

### Motivo

Essa task vem depois do schema porque o backend deve subir em cima de um dominio ja decidido.

### Resultado esperado

- app backend separado
- servidor Fastify inicializado
- Prisma Client configurado
- estrutura modular pronta

### Dependencias

- Task 1 concluida

### Subtasks

#### 2.1 Criar a pasta `backend/`

O que fazer:
- criar o projeto backend separado da app web

Pronto quando:
- a raiz `backend/` existe

#### 2.2 Criar `package.json` do backend

O que fazer:
- inicializar dependencias e scripts

Scripts minimos:
- `dev`
- `build`
- `start`
- `lint`
- `prisma:generate`
- `prisma:migrate`

Pronto quando:
- scripts basicos estao definidos

#### 2.3 Configurar TypeScript

O que fazer:
- criar `tsconfig.json`

Motivo:
- base tipada desde o inicio

Pronto quando:
- projeto compila em TS

#### 2.4 Configurar Fastify bootstrap

O que fazer:
- criar `src/app/create-app.ts`
- criar `src/app/server.ts`

Motivo:
- separar criacao da app de bootstrap do processo

Pronto quando:
- servidor sobe localmente

#### 2.5 Configurar env e config

O que fazer:
- criar `.env.example`
- criar `src/shared/config`

Motivo:
- centralizar configuracao

Pronto quando:
- app le variaveis de ambiente de forma consistente

#### 2.6 Configurar Prisma Client

O que fazer:
- instalar Prisma Client
- criar plugin de acesso ao Prisma

Motivo:
- acesso ao banco precisa ficar centralizado

Pronto quando:
- Prisma pode ser injetado e usado no app

#### 2.7 Configurar logger e erro base

O que fazer:
- criar logger padrao
- criar tratamento base de erro

Motivo:
- evitar respostas inconsistentes e logs espalhados

Pronto quando:
- app responde erros basicos de forma padronizada

#### 2.8 Criar estrutura modular

O que fazer:
- criar pastas:
  - `auth`
  - `users`
  - `templates`
  - `characters`
  - `stats`
  - `resources`
  - `items`
  - `actions`
  - `effects`
  - `links`
  - `snapshots`

Motivo:
- refletir o dominio do sistema

Pronto quando:
- arvore modular esta criada

## 6. Task 3 - Autenticacao e ownership

### Motivo

Toda operacao real da ficha depende de ownership. Auth precisa entrar antes do CRUD real.

### Resultado esperado

- JWT do Supabase validado
- `request.user` disponivel
- endpoints basicos de sessao e perfil

### Dependencias

- Task 1 concluida
- Task 2 concluida

### Subtasks

#### 3.1 Criar plugin de autenticacao

O que fazer:
- ler token do header
- validar JWT do Supabase

Pronto quando:
- token valido autentica
- token invalido falha

#### 3.2 Resolver usuario interno

O que fazer:
- localizar ou sincronizar `User` com base no auth provider

Pronto quando:
- usuario autenticado tem representacao interna

#### 3.3 Expor contexto autenticado

O que fazer:
- adicionar `request.user`

Pronto quando:
- modulos conseguem usar usuario autenticado sem depender do payload

#### 3.4 Implementar `POST /auth/session/validate`

O que fazer:
- endpoint para validar sessao e retornar contexto util

Pronto quando:
- frontend pode validar sessao no backend

#### 3.5 Implementar `GET /me`

O que fazer:
- retornar dados do usuario autenticado

Pronto quando:
- rota responde com usuario certo

## 7. Task 4 - Nucleo da ficha

### Motivo

Essa task cria a primeira unidade de valor real: uma ficha funcional.

### Resultado esperado

- CRUD de personagens
- stats, resources e notes funcionando
- templates consultaveis

### Dependencias

- Task 1 concluida
- Task 2 concluida
- Task 3 concluida

### Subtasks

#### 4.1 Implementar modulo `templates`

O que fazer:
- criar repository, service, controller e route de templates

Pronto quando:
- `GET /templates` funciona

#### 4.2 Implementar modulo `characters`

O que fazer:
- criar CRUD base de personagem

Rotas:
- `POST /characters`
- `GET /characters`
- `GET /characters/:id`
- `PATCH /characters/:id`
- `DELETE /characters/:id`

Pronto quando:
- personagem pode ser criado, listado, lido, alterado e removido pelo dono

#### 4.3 Implementar modulo `stats`

O que fazer:
- permitir salvar e atualizar stats do personagem

Rota:
- `PUT /characters/:id/stats`

Pronto quando:
- stats persistem corretamente

#### 4.4 Implementar modulo `resources`

O que fazer:
- permitir salvar e atualizar resources

Rota:
- `PUT /characters/:id/resources`

Pronto quando:
- resources persistem corretamente

#### 4.5 Implementar modulo `notes`

O que fazer:
- permitir salvar notas livres por secao

Pronto quando:
- personagem suporta conteudo textual livre

#### 4.6 Garantir ownership em todo o nucleo

O que fazer:
- revisar queries de personagem, stats, resources e notes

Pronto quando:
- usuario nao acessa ficha de outro usuario

## 8. Task 5 - Inventario, actions e effects

### Motivo

Essas entidades precisam existir antes de qualquer automacao real.

### Resultado esperado

- itens, actions e effects cadastraveis
- suporte a estrutura + metadados variaveis

### Dependencias

- Task 4 concluida

### Subtasks

#### 5.1 Implementar modulo `items`

O que fazer:
- criar cadastro e edicao de itens

Rotas:
- `POST /characters/:id/items`
- `PATCH /characters/:id/items/:itemId`

Pronto quando:
- item pode ser criado e editado

#### 5.2 Implementar modulo `actions`

O que fazer:
- criar cadastro e edicao de actions

Rotas:
- `POST /characters/:id/actions`
- `PATCH /characters/:id/actions/:actionId`

Pronto quando:
- action pode ser criada e editada

#### 5.3 Implementar modulo `effects`

O que fazer:
- criar cadastro de effects

Rota:
- `POST /characters/:id/effects`

Pronto quando:
- effect pode ser persistido e ativado

#### 5.4 Validar campos variaveis

O que fazer:
- suportar `metaJson`, `costJson`, `damageJson`, `payloadJson`

Motivo:
- permitir flexibilidade sem destruir o schema

Pronto quando:
- dados variaveis passam com validacao minima coerente

## 9. Task 6 - Links e automacoes

### Motivo

So agora existem entidades suficientes para ligar uma coisa na outra.

### Resultado esperado

- links persistidos
- operacoes pre-definidas funcionando
- recalc de estado derivado funcionando

### Dependencias

- Task 5 concluida

### Subtasks

#### 6.1 Implementar modulo `links`

O que fazer:
- criar persistencia e operacao de links

Rotas:
- `POST /characters/:id/links`
- `DELETE /characters/:id/links/:linkId`

Pronto quando:
- link pode ser criado e removido

#### 6.2 Definir shape de source e target

O que fazer:
- padronizar origem e alvo de links

Motivo:
- evitar links vagos e ambiguos

Pronto quando:
- shape esta travado e testavel

#### 6.3 Implementar operacoes da V1

Operacoes:
- `add`
- `subtract`
- `set_from_stat`
- `sum_weights`
- `consume_resource`

Pronto quando:
- operacoes basicas existem no motor

#### 6.4 Criar service de recalc

O que fazer:
- ler links ativos
- aplicar efeitos
- produzir estado derivado

Pronto quando:
- service resolve mudancas previsiveis

#### 6.5 Expor `POST /characters/:id/recalculate`

O que fazer:
- endpoint que aciona recalc

Pronto quando:
- frontend consegue pedir recalc

## 10. Task 7 - Ficha agregada e snapshots

### Motivo

O frontend precisa de uma leitura principal pronta, e nao de varias chamadas fragmentadas.

### Resultado esperado

- endpoint `sheet`
- snapshots de estado derivado
- payload agregado consistente

### Dependencias

- Task 6 concluida

### Subtasks

#### 7.1 Implementar modulo `snapshots`

O que fazer:
- criar persistencia de snapshots

Pronto quando:
- snapshots podem ser gravados

#### 7.2 Criar agregador da ficha

O que fazer:
- compor personagem + stats + resources + items + actions + effects + links + notes + resumo derivado

Pronto quando:
- service retorna uma ficha completa

#### 7.3 Implementar `GET /characters/:id/sheet`

O que fazer:
- expor a leitura agregada para o frontend

Pronto quando:
- rota retorna payload pronto para consumo

#### 7.4 Revisar indices e custo de leitura

O que fazer:
- revisar relacoes e indices mais usados

Pronto quando:
- leitura principal nao depende de estrutura ineficiente obvia

## 11. Task 8 - Testes e endurecimento

### Motivo

Links, ownership e estado derivado aumentam muito o risco de erro silencioso. Essa task fecha a qualidade tecnica da base.

### Resultado esperado

- testes principais cobrindo fluxo
- erros padronizados
- ownership protegido
- logs e validacoes revisados

### Dependencias

- Task 7 concluida

### Subtasks

#### 8.1 Criar testes de integracao

Cobrir:
- auth
- create/list/get/update/delete de personagem
- stats
- resources
- items
- actions
- effects
- links
- recalc
- sheet

Pronto quando:
- cenarios principais estao cobertos

#### 8.2 Criar testes de dominio para automacao

Cobrir:
- `add`
- `subtract`
- `set_from_stat`
- `sum_weights`
- `consume_resource`

Pronto quando:
- motor de automacao tem comportamento previsivel

#### 8.3 Padronizar erros

O que fazer:
- revisar respostas de validacao, auth, ownership e dominio

Pronto quando:
- API responde erro de forma consistente

#### 8.4 Revisar ownership final

O que fazer:
- revisar todas as queries mutaveis e de leitura sensivel

Pronto quando:
- nenhum acesso indevido passa

#### 8.5 Revisar performance minima

O que fazer:
- revisar endpoint agregado
- revisar recalc
- revisar queries principais

Pronto quando:
- nao ha gargalo estrutural obvio para a V1

## 12. Regras obrigatorias durante toda a execucao

1. Nao hardcodar regras de D&D ou Tormenta no nucleo.
2. Nao confiar em `user_id` vindo do cliente.
3. Nao espalhar logica de dominio em route ou controller.
4. Nao usar `jsonb` para tudo.
5. Sempre separar estado base de estado derivado onde houver automacao.
6. Toda mutacao importante deve manter a ficha consistente.
7. Ownership deve existir desde o inicio da implementacao.
8. O endpoint principal da ficha deve ser desenhado para consumo real do frontend.

## 13. Definicao de pronto da V1 tecnica

A base sera considerada pronta quando:

- usuario autenticado puder criar e listar fichas
- a ficha suportar dados livres e estruturados
- stats e resources estiverem estaveis
- items, actions e effects puderem ser cadastrados manualmente
- links simples gerarem automacoes previsiveis
- `GET /characters/:id/sheet` existir
- snapshots de estado derivado existirem
- a arquitetura estiver pronta para templates mais ricos no futuro
