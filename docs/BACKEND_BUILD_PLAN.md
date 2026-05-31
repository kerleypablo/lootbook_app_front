# Lootbook Backend Build Plan

## 1. Objetivo

Construir uma base de backend, API e banco de dados robusta para a V1 do Lootbook, com foco em:
- ficha individual do usuario
- dados livres + estruturados
- links e automacoes simples
- arquitetura limpa e escalavel

Stack travada para a V1:
- Fastify
- Prisma
- PostgreSQL via Supabase
- Supabase Auth

## 2. Ordem de Construcao

### Fase 1. Fundamentos

Objetivo:
criar a base tecnica do backend.

Entregas:
- criar a pasta `backend/`
- inicializar projeto Node/TypeScript
- configurar Fastify
- configurar Prisma
- configurar variaveis de ambiente
- configurar logger
- definir estrutura modular
- conectar ao PostgreSQL do Supabase
- configurar autenticacao via Supabase JWT

Tasks:
- criar `package.json` do backend
- definir scripts de `dev`, `build`, `start`, `lint`
- criar bootstrap do servidor
- criar `prisma/schema.prisma`
- configurar `.env.example`
- criar plugin de autenticacao
- criar plugin de Prisma
- criar tratamento base de erro

Criterios de aceite:
- backend sobe localmente
- conecta ao banco
- valida sessao com token do Supabase
- estrutura interna esta pronta para receber modulos

### Fase 2. Dominio base da ficha

Objetivo:
entregar o nucleo minimo da ficha.

Entregas:
- `users`
- `character_templates`
- `characters`
- `character_stats`
- `character_resources`
- `character_notes`

Tasks:
- modelar as tabelas iniciais
- criar migrations
- criar modulos e services
- criar CRUD base de personagem
- criar endpoint `GET /me`
- criar endpoint `GET /templates`
- criar leitura e escrita de stats e resources
- criar leitura e escrita de notes

Criterios de aceite:
- usuario autenticado consegue criar ficha
- usuario lista apenas as proprias fichas
- stats e resources podem ser salvos e lidos
- personagem suporta campos livres e estruturados

### Fase 3. Inventario e acoes

Objetivo:
registrar componentes jogaveis da ficha.

Entregas:
- `character_items`
- `character_actions`
- `character_effects`

Tasks:
- modelar tabelas de itens, acoes e efeitos
- criar schemas de validacao
- criar endpoints de cadastro e edicao
- suportar `meta_json` para extensibilidade
- permitir marcar item como equipado

Criterios de aceite:
- usuario cadastra itens e equipamentos
- usuario cadastra acoes e efeitos
- backend armazena dados estruturados e campos variaveis

### Fase 4. Links e automacoes

Objetivo:
introduzir o motor minimo de automacao.

Entregas:
- `character_links`
- engine de resolucao simples
- operacoes pre-definidas
- recalc de estado derivado

Tasks:
- modelar `character_links`
- criar service de resolucao
- implementar operacoes da V1:
  - `add`
  - `subtract`
  - `set_from_stat`
  - `sum_weights`
  - `consume_resource`
- criar endpoint `POST /characters/:id/recalculate`
- atualizar resumo derivado da ficha

Criterios de aceite:
- usuario consegue vincular entidades
- recalc altera estado derivado previsto
- automacoes simples sao reproduziveis e testaveis

### Fase 5. Leitura otimizada da ficha

Objetivo:
servir o frontend com uma visao agregada e performatica.

Entregas:
- endpoint agregado `GET /characters/:id/sheet`
- `character_snapshots`
- resumo derivado
- indices principais

Tasks:
- definir shape agregado da ficha
- montar query/service de agregacao
- criar snapshots de estado derivado
- criar indices importantes
- revisar payloads para leitura principal do app

Criterios de aceite:
- frontend consegue carregar uma ficha completa em uma chamada principal
- snapshot nao corrompe estado base
- leitura da ficha nao depende de N chamadas fragmentadas

### Fase 6. Robustez

Objetivo:
endurecer a base para crescimento real.

Entregas:
- testes automatizados
- validacao consistente
- logs e erros padronizados
- observabilidade basica

Tasks:
- criar testes de integracao e unidade
- validar payloads invalidos
- testar ownership e autorizacao
- padronizar responses de erro
- revisar limites de dados e consistencia

Criterios de aceite:
- casos principais da API estao cobertos
- falhas de ownership estao bloqueadas
- erros invalidos retornam resposta consistente

## 3. Backlog Tecnico Prioritario

### Infra
- bootstrap do Fastify
- plugin de Prisma
- plugin de auth
- config de env
- logger
- tratamento global de erro

### Banco
- schema Prisma inicial
- migrations versionadas
- indices basicos
- colunas `jsonb` onde necessario

### Dominio
- aggregates de personagem
- separacao entre estado base e derivado
- services de recalc
- services de ownership

### API
- rotas autenticadas
- validacao de input
- retorno consistente
- endpoint agregado da ficha

## 4. Estrutura de Tarefas Recomendada

### Sprint 1
- criar `backend/`
- configurar Fastify
- configurar Prisma
- conectar Supabase/Postgres
- configurar auth

### Sprint 2
- modelar `users`, `templates`, `characters`
- implementar CRUD basico de personagem
- implementar `GET /me` e `GET /templates`

### Sprint 3
- modelar `stats`, `resources`, `notes`
- implementar escrita e leitura dessas entidades

### Sprint 4
- modelar `items`, `actions`, `effects`
- implementar endpoints correspondentes

### Sprint 5
- modelar `links`
- construir motor simples de automacao
- implementar `recalculate`

### Sprint 6
- construir endpoint agregado `sheet`
- adicionar snapshots
- revisar indices

### Sprint 7
- testes
- endurecimento de validacao
- revisao final da arquitetura

## 5. Requisitos de Qualidade

### Arquitetura
- modulo por dominio
- services sem dependencia de HTTP
- repositories isolando acesso a dados
- validacao antes de entrar no dominio

### Performance
- evitar recomputacao desnecessaria
- endpoint principal da ficha com resposta agregada
- consultas com indices nas relacoes principais

### Manutenibilidade
- nomes claros
- tipagem consistente
- contratos de API previsiveis
- sem hardcode por sistema oficial no nucleo

### Seguranca
- ownership obrigatorio
- auth baseada no Supabase JWT
- nenhuma mutacao confiando em `user_id` vindo do cliente

## 6. Testes Obrigatorios

Cobertura minima esperada:
- criacao de personagem com template
- leitura apenas da propria ficha
- CRUD de stats
- CRUD de resources
- criacao de item equipado e nao equipado
- criacao de acao vinculada a uma entidade da ficha
- criacao e aplicacao de link simples
- recalc atualizando estado derivado
- geracao de snapshot
- payload invalido sendo rejeitado
- tentativa de acesso a personagem de outro usuario sendo bloqueada

## 7. Resultado Esperado

Ao final desse plano, o projeto deve ter:
- uma base backend limpa
- um schema inicial coerente
- uma API pronta para o frontend consumir
- suporte a ficha generica
- automacao simples configuravel
- caminho aberto para templates mais ricos no futuro
