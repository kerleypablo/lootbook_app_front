# Lootbook Backend Architecture

## 1. Stack Oficial

O backend da V1 sera construido com:
- Fastify
- Prisma
- PostgreSQL via Supabase
- Supabase Auth

## 2. Papel de Cada Parte

### Supabase
Sera usado como base de infraestrutura inicial para:
- PostgreSQL
- autenticacao
- ambiente rapido de desenvolvimento

### Fastify
Sera o backend principal da aplicacao:
- roteamento HTTP
- validacao de requests
- servicos de dominio
- agregacao da ficha
- recalc de estado derivado

### Prisma
Sera a camada de modelagem e acesso ao banco:
- schema do banco
- migrations
- repositories / acesso tipado

## 3. Principios de Arquitetura

### Dominio separado de HTTP
Controllers e rotas nao devem carregar regra de negocio relevante. A logica deve viver em servicos e modulos do dominio.

### Backend centrado em ficha
O backend nao sera modelado como "backend de D&D" ou "backend de Tormenta". O centro do sistema sera a ficha do personagem e seus componentes.

### Automacoes por dados e vinculos
Sempre que possivel, o backend deve modelar automacoes como dados configuraveis em vez de espalhar `if/else` por sistema ou por item.

### Estrutura hibrida
O schema deve combinar:
- colunas relacionais para dados criticos e consultaveis
- `jsonb` para extensibilidade e customizacao

### Separacao entre estado base e estado derivado
O sistema deve diferenciar:
- o que o usuario cadastrou
- o que foi calculado a partir disso

## 4. Estrutura Sugerida do Backend

O backend sera criado em uma pasta separada:

```txt
backend/
  src/
    app/
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
      snapshots/
    shared/
```

Cada modulo deve seguir uma organizacao consistente:
- route
- controller
- service
- repository
- schema
- types

## 5. Modulos da V1

### `auth`
- validacao de sessao
- leitura do usuario autenticado
- integracao com Supabase JWT

### `users`
- perfil basico do usuario
- dados minimos internos do sistema

### `templates`
- templates de ficha
- configuracao base por sistema ou modelo

### `characters`
- entidade principal do personagem
- metadados da ficha
- status geral

### `stats`
- atributos e valores numericos relevantes

### `resources`
- vida, mana, usos, cargas e recursos similares

### `items`
- inventario, equipamentos, armas, armaduras e consumiveis

### `actions`
- ataques, magias, tecnicas, habilidades e acoes do personagem

### `effects`
- bonus, penalidades, modificadores e efeitos ativos/passivos

### `links`
- vinculos entre entidades da ficha
- regras simples de automacao

### `snapshots`
- foto consistente do estado da ficha
- historico e auditoria leve

## 6. Entidades Iniciais

### `users`
Campos minimos:
- `id`
- `auth_provider_id`
- `email`
- `display_name`
- `created_at`
- `updated_at`

### `character_templates`
Campos minimos:
- `id`
- `key`
- `name`
- `description`
- `system_family`
- `is_official`
- `config_json`
- `created_at`
- `updated_at`

### `characters`
Campos minimos:
- `id`
- `user_id`
- `template_id`
- `name`
- `level`
- `status`
- `portrait_url`
- `summary_json`
- `created_at`
- `updated_at`

### `character_stats`
Campos minimos:
- `id`
- `character_id`
- `key`
- `label`
- `base_value`
- `current_value`
- `max_value`
- `meta_json`
- `created_at`
- `updated_at`

### `character_resources`
Campos minimos:
- `id`
- `character_id`
- `key`
- `label`
- `current_value`
- `max_value`
- `reset_rule`
- `meta_json`
- `created_at`
- `updated_at`

### `character_items`
Campos minimos:
- `id`
- `character_id`
- `name`
- `type`
- `equipped`
- `quantity`
- `weight`
- `meta_json`
- `created_at`
- `updated_at`

### `character_actions`
Campos minimos:
- `id`
- `character_id`
- `name`
- `action_type`
- `cost_json`
- `roll_json`
- `damage_json`
- `meta_json`
- `created_at`
- `updated_at`

### `character_effects`
Campos minimos:
- `id`
- `character_id`
- `source_type`
- `source_label`
- `effect_type`
- `payload_json`
- `active`
- `created_at`
- `updated_at`

### `character_links`
Campos minimos:
- `id`
- `character_id`
- `source_type`
- `source_id`
- `target_type`
- `target_id`
- `operation`
- `config_json`
- `created_at`
- `updated_at`

### `character_notes`
Campos minimos:
- `id`
- `character_id`
- `section`
- `content`
- `created_at`
- `updated_at`

### `character_snapshots`
Campos minimos:
- `id`
- `character_id`
- `version`
- `derived_state_json`
- `created_at`

## 7. Regras de Modelagem

1. Nao modelar o banco em torno de raca/classe fixas.
2. O backend deve aceitar sistemas diferentes sem depender de tabelas exclusivas de um unico ruleset.
3. O estado cadastrado pelo usuario e o estado calculado devem ser separados.
4. Campos variaveis devem usar `jsonb` quando isso evitar explosao de schema.
5. Toda entidade principal deve ter IDs estaveis e timestamps.
6. Ownership deve ser rastreado por personagem e usuario.

## 8. Interface Conceitual da API

### Auth e usuario
- `POST /auth/session/validate`
- `GET /me`

### Templates
- `GET /templates`

### Characters
- `POST /characters`
- `GET /characters`
- `GET /characters/:id`
- `PATCH /characters/:id`
- `DELETE /characters/:id`

### Stats e resources
- `PUT /characters/:id/stats`
- `PUT /characters/:id/resources`

### Itens, acoes e efeitos
- `POST /characters/:id/items`
- `PATCH /characters/:id/items/:itemId`
- `POST /characters/:id/actions`
- `PATCH /characters/:id/actions/:actionId`
- `POST /characters/:id/effects`

### Links e automacao
- `POST /characters/:id/links`
- `DELETE /characters/:id/links/:linkId`
- `POST /characters/:id/recalculate`

### Ficha agregada
- `GET /characters/:id/sheet`

## 9. Estrategia de Automacao da V1

A V1 nao tera linguagem livre de formulas.

Em vez disso, a automacao sera baseada em operacoes pre-definidas como:
- `add`
- `subtract`
- `set_from_stat`
- `sum_weights`
- `consume_resource`

Essas operacoes serao aplicadas por um motor simples de resolucao de links.

O objetivo da V1 nao e suportar todos os cenarios possiveis, e sim viabilizar automacoes previsiveis, testaveis e extensíveis.

## 10. Seguranca e Ownership

Regras obrigatorias:
- cada ficha pertence a um usuario
- toda mutacao deve validar ownership
- toda leitura de detalhe deve validar ownership
- o backend deve validar o JWT emitido pelo Supabase

O backend nunca deve confiar em `user_id` vindo do payload como fonte de verdade.

## 11. Performance

Principios:
- otimizar leitura da ficha por personagem
- evitar recalc completo em toda leitura quando nada mudou
- indexar relacoes principais
- permitir snapshot ou resumo derivado agregado

Indices iniciais esperados:
- `characters.user_id`
- `characters.template_id`
- `character_stats.character_id`
- `character_resources.character_id`
- `character_items.character_id`
- `character_actions.character_id`
- `character_effects.character_id`
- `character_links.character_id`
- `character_snapshots.character_id`

## 12. Resultado Esperado da Arquitetura

Ao final da base inicial, o backend deve estar preparado para:
- servir o frontend atual com uma API consistente
- armazenar fichas livres e estruturadas
- permitir automacoes simples
- suportar templates de sistema no futuro
- crescer para recursos mais avancados sem refazer o nucleo
