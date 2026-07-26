# Lootbook Backend Module Architecture

Este documento define a arquitetura atual do backend e a regra oficial de organizacao das pastas e modulos.

Ele deve ser seguido por qualquer pessoa ou IA que criar, mover ou alterar codigo dentro de `backend/`.

Objetivo:
- manter o backend consistente
- evitar regra de negocio espalhada
- preservar ownership e separacao de responsabilidades
- garantir que novos modulos sigam o mesmo padrao

## 1. Estilo de arquitetura usado

O backend usa uma arquitetura de:
- monolito modular
- organizacao por dominio / feature
- camadas internas por modulo

Isso significa:
- o sistema roda como uma unica aplicacao backend
- cada dominio principal da ficha vive em um modulo proprio
- cada modulo possui suas proprias camadas de HTTP, regra de negocio, persistencia e contrato

O backend **nao** esta organizado como:
- microservicos
- estrutura global por camada unica como `controllers/`, `services/`, `repositories/` soltos na raiz
- hexagonal pura com boundaries formais completos

Na pratica, o modelo atual e:
- `modules/` separa por dominio
- cada modulo usa `route`, `controller`, `service`, `repository`, `schema` e `types`
- `shared/` concentra infraestrutura transversal
- `app/` concentra bootstrap e composicao da aplicacao

## 2. Estrutura oficial de pastas

```txt
backend/
  prisma/
    schema.prisma
    migrations/

  src/
    app/
      create-app.ts
      server.ts
      routes.ts

    shared/
      config/
      errors/
      plugins/
      types/

    modules/
      auth/
      users/
      templates/
      characters/
      stats/
      resources/
      items/
      actions/
      effects/
      links/
      notes/
      snapshots/
```

## 3. Papel de cada pasta principal

### `backend/prisma`

Responsabilidade:
- modelagem do banco
- schema Prisma
- migrations
- definicao das entidades persistidas

Usar para:
- `schema.prisma`
- migrations geradas
- configuracoes ligadas a modelagem do banco

Nao usar para:
- regra de negocio HTTP
- validacao de request
- logica de controller

### `backend/src/app`

Responsabilidade:
- bootstrap da aplicacao
- criacao do servidor Fastify
- composicao geral do backend
- registro central de plugins e rotas

Arquivos esperados:
- `create-app.ts`
- `server.ts`
- `routes.ts`

Usar para:
- instanciar Fastify
- registrar plugins compartilhados
- registrar modulos de rota
- subir o servidor

Nao usar para:
- regra de negocio de dominio
- query de banco
- logica especifica de feature

### `backend/src/shared`

Responsabilidade:
- infraestrutura compartilhada
- codigo transversal
- utilitarios comuns do backend

Regra:
- tudo em `shared/` deve ser realmente reutilizavel por mais de um modulo ou ser parte da infraestrutura global

Subpastas:

#### `shared/config`

Responsabilidade:
- leitura de env
- configuracao central
- logger base

Exemplos:
- `env.ts`
- `logger.ts`

#### `shared/errors`

Responsabilidade:
- erros padronizados
- tratamento global de erro

Exemplos:
- `app-error.ts`
- `error-handler.ts`

#### `shared/plugins`

Responsabilidade:
- plugins do Fastify reutilizaveis
- integracoes globais como Prisma e autenticacao

Exemplos:
- `prisma.ts`
- `auth.ts`

#### `shared/types`

Responsabilidade:
- tipos compartilhados entre modulos quando fizer sentido

Regra:
- se um tipo pertence claramente a um unico dominio, ele deve ficar no proprio modulo

### `backend/src/modules`

Responsabilidade:
- concentrar os dominios e features do backend
- agrupar codigo por responsabilidade real do produto

Cada pasta em `modules/` representa um dominio da ficha ou uma feature de suporte.

Regra principal:
- se o codigo pertence claramente a um unico dominio, ele deve ficar no modulo desse dominio

## 4. Estrutura obrigatoria de cada modulo

Cada modulo deve seguir este padrao sempre que aplicavel:

```txt
module-name/
  controller.ts
  repository.ts
  route.ts
  schema.ts
  service.ts
  types.ts
```

Nem todo modulo precisa crescer no mesmo ritmo, mas a responsabilidade de cada arquivo deve permanecer a mesma.

### `route.ts`

Responsabilidade:
- definir endpoints Fastify
- ligar rota ao controller
- aplicar `preHandler`
- anexar schemas de validacao e resposta

Deve:
- ser fino
- apenas montar a interface HTTP do modulo

Nao deve:
- fazer regra de negocio
- fazer query direta no banco
- decidir ownership sozinho

### `controller.ts`

Responsabilidade:
- receber `request` e `reply`
- ler `params`, `query`, `body` e contexto autenticado
- chamar o `service`
- devolver resposta HTTP

Deve:
- ser fino
- traduzir entrada HTTP para chamada de caso de uso
- traduzir resultado do service para resposta

Nao deve:
- conter regra de negocio importante
- montar query Prisma
- espalhar regra de dominio

### `service.ts`

Responsabilidade:
- conter regra de negocio
- coordenar fluxo do caso de uso
- aplicar ownership
- garantir consistencia da operacao

Deve:
- centralizar a logica real da feature
- chamar repositories quando necessario
- validar pre-condicoes de negocio
- registrar erros relevantes com contexto util

Nao deve:
- depender de detalhes HTTP quando isso puder ser evitado
- virar deposito de query solta sem criterio

### `repository.ts`

Responsabilidade:
- encapsular acesso ao banco
- isolar queries Prisma
- devolver dados de persistencia de forma previsivel

Deve:
- receber filtros e ids claros
- aplicar consultas reutilizaveis
- manter ownership no nivel de query quando necessario

Nao deve:
- conter regra de negocio de alto nivel
- decidir fluxo completo do caso de uso

### `schema.ts`

Responsabilidade:
- definir contrato da API
- validar entrada e resposta

Usar para:
- body schema
- params schema
- querystring schema
- response schema

Motivo:
- evitar payload inconsistente
- tornar a API previsivel para frontend e testes

### `types.ts`

Responsabilidade:
- tipos locais do modulo
- DTOs internos
- tipos de payload, filtros e respostas quando fizer sentido

Regra:
- tipos de um unico dominio ficam no modulo
- tipos realmente compartilhados podem subir para `shared/types`

## 5. Definicao de cada modulo atual

### `auth`

Responsabilidade:
- validacao de sessao
- leitura e validacao do token do Supabase
- criacao do contexto autenticado da request

Exemplos de uso:
- `POST /auth/session/validate`
- verificacao de `Authorization: Bearer ...`

### `users`

Responsabilidade:
- representacao interna do usuario
- sincronizacao com o auth provider
- perfil minimo do usuario autenticado

Exemplos de uso:
- `GET /me`
- sync do `User` interno a partir do Supabase Auth

### `templates`

Responsabilidade:
- templates de ficha
- modelos base por sistema, familia ou configuracao

### `characters`

Responsabilidade:
- agregado principal da ficha
- CRUD base do personagem
- ownership da ficha

### `stats`

Responsabilidade:
- atributos e valores numericos estruturados
- persistencia e atualizacao de stats

### `resources`

Responsabilidade:
- HP, mana, cargas, usos e recursos similares
- atualizacao de estado rastreavel separado de stats

### `items`

Responsabilidade:
- inventario
- equipamentos
- armas, armaduras e consumiveis

### `actions`

Responsabilidade:
- ataques
- poderes
- magias
- tecnicas e acoes do personagem

### `effects`

Responsabilidade:
- bonus
- penalidades
- modificadores ativos ou passivos

### `links`

Responsabilidade:
- vinculos entre entidades da ficha
- base do motor de automacao
- recalc de estado derivado

### `notes`

Responsabilidade:
- texto livre da ficha
- notas por secao
- conteudo nao estruturado, mas ainda pertencente ao personagem

### `snapshots`

Responsabilidade:
- persistencia de estado derivado
- leitura agregada da ficha
- historico de versoes quando aplicavel

## 6. Fluxo padrao de uma request

O fluxo desejado do backend e:

```txt
HTTP Request
  -> route
  -> controller
  -> service
  -> repository
  -> Prisma / database
  -> response
```

Quando a rota for autenticada:

```txt
HTTP Request
  -> auth plugin
  -> request.user / request.auth
  -> route
  -> controller
  -> service
  -> repository
  -> Prisma / database
  -> response
```

### Modo temporario sem login

Enquanto o frontend nao possuir fluxo de login, `AUTH_REQUIRED=false` permite que requests sem `Authorization` usem um unico usuario interno convidado.

Regras:
- esse modo existe apenas para desenvolvimento inicial
- ownership continua usando `request.user`, nunca um `userId` enviado pelo cliente
- token informado continua sendo validado; token invalido continua falhando
- antes de publicar o backend, configurar `AUTH_REQUIRED=true`

## 7. Regras obrigatorias para novos modulos e alteracoes

1. Nao colocar regra de negocio relevante em `route.ts`.
2. Nao colocar regra de negocio relevante em `controller.ts`.
3. Toda query Prisma deve preferencialmente ficar em `repository.ts`.
4. Ownership nao pode depender de `userId` vindo do cliente.
5. O usuario autenticado deve vir de `request.user`.
6. Modulos devem ser orientados por dominio, nao por tela.
7. `shared/` nao deve virar deposito generico.
8. Todo erro importante deve gerar log com contexto suficiente para diagnostico.
9. Validacao de payload deve ficar em `schema.ts` sempre que houver contrato HTTP.
10. Estado base e estado derivado nao devem ser misturados sem necessidade.

## 8. Quando criar algo em `shared/` e quando criar no modulo

Colocar em `shared/` quando:
- o codigo for infraestrutura global
- o codigo for reutilizado por varios modulos
- o codigo nao pertencer claramente a um dominio unico

Colocar no modulo quando:
- a regra pertencer a uma feature especifica
- o tipo fizer sentido apenas naquele dominio
- a query existir para atender aquele caso de uso do modulo

Regra pratica:
- se houver duvida, comece no modulo
- so mova para `shared/` quando a reutilizacao for real

## 9. Direcao oficial para evolucao futura

Qualquer nova implementacao no backend deve seguir este modelo:
- criar ou completar o modulo correto em `src/modules`
- manter `controller` fino
- centralizar regra no `service`
- centralizar persistencia no `repository`
- validar contrato em `schema`
- usar `shared/` apenas para infraestrutura e reutilizacao real

Essa passa a ser a regra oficial de arquitetura do backend para a continuidade da V1.
