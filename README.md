# LOOTBOOK

Lootbook e um projeto frontend em evolucao para uma ficha digital generica de RPG de mesa.

O produto esta sendo construído para substituir a ficha de papel por uma ficha online flexivel, estruturada e com automacoes opcionais.

## Documentacao

Documentos principais do projeto:
- [Regras de arquitetura frontend](docs/ARCHITECTURE_RULES.md)
- [Visao do produto](docs/PRODUCT_VISION.md)
- [Arquitetura de backend](docs/BACKEND_ARCHITECTURE.md)
- [Plano de construcao do backend](docs/BACKEND_BUILD_PLAN.md)

## Estrutura

O repositorio esta sendo organizado para:

```txt
lootbook/
  frontend/
  backend/
  docs/
```

Neste momento:
- `frontend/` e a app web canonica
- `backend/` concentra a modelagem e a futura API
- `docs/` concentra a documentacao oficial

## Frontend Atual

O frontend atual inclui:
- home com carrossel de personagens
- fluxo inicial de criacao de personagem
- tela de detalhe do personagem
- painel de stats e informacoes no overlay
- animacoes suaves de transicao
- layout responsivo mobile-first

## Stack Atual do Frontend

- Next.js
- React
- TypeScript
- CSS Modules
- Framer Motion
- React Icons

## Direcao do Produto

O Lootbook nao sera fechado em um unico sistema de RPG.

A direcao atual do produto e:
- ficha generica por design
- suporte futuro a templates de sistema
- dados livres + estruturados
- links e automacoes simples
- backend planejado com Fastify + Prisma + PostgreSQL via Supabase

## Instalacao

### Frontend

Entre em `frontend/` e rode:

```bash
npm install
npm run dev
```

### URL

Abra:

```txt
http://localhost:3000
```

## Estrutura Atual

- `frontend/src/app` - rotas e composicao do Next.js
- `frontend/src/features` - features de dominio da aplicacao
- `frontend/src/shared` - componentes compartilhados
- `backend` - base do backend e modelagem do banco
- `docs` - documentacao oficial do projeto
- `frontend/public/images` - imagens do app
