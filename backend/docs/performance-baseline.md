# Performance mínima da V1

## Caminhos críticos revisados

### Ficha agregada — `GET /characters/:id/sheet`

O agregador parte de uma ficha única filtrada por `id + userId`, carrega as relações necessárias e seleciona somente os campos enviados ao frontend. Não há consulta por entidade em loop no código da aplicação. O snapshot usa `take: 1` com ordenação por versão, evitando carregar o histórico inteiro.

### Recálculo — `POST /characters/:id/recalculate`

O recálculo carrega apenas a entrada necessária ao motor: valores numéricos de stats/resources, campos mínimos de itens, IDs de actions, efeitos e links. A transformação de `Decimal` para número acontece uma vez na borda do repositório. O cálculo é puramente em memória e não executa consultas adicionais por link ou efeito.

### Escritas e snapshots

Substituições de stats, resources e notes ocorrem dentro de transações curtas. A criação de snapshot usa transação serializável curta e faz, no máximo, três tentativas quando há conflito de concorrência. Nenhuma transação faz chamada de rede externa.

## Índices validados

Todos os filhos da ficha possuem índice em `characterId`. Stats, resources e snapshots também possuem índices únicos compostos que atendem sua chave lógica:

- `(characterId, key)` para stats e resources;
- `(characterId, version)` para snapshots.

Esses índices também sustentam as leituras ordenadas por chave e a busca do último snapshot por personagem. `characters.userId` cobre a lista de fichas por usuário e todos os relacionamentos FK usados pela ficha possuem índice no lado referenciante.

## Decisão sobre índices adicionais

Não foi criado índice composto extra para cada ordenação de lista (`items`, `actions`, `effects`, `links` e `notes`). Cada conjunto pertence a uma única ficha e tende a ser pequeno; criar cinco índices extras aumentaria o custo de inserção/edição sem evidência de ganho. A revisão deve ser reaberta com `EXPLAIN ANALYZE` e dados representativos quando houver métricas de produção ou fichas grandes.

O próximo candidato, caso a listagem de personagens cresça, é um índice composto em `characters(user_id, updated_at DESC)`, pois a listagem filtra por usuário e ordena por atualização. Ele permanece adiado até existir necessidade observável.

## Verificações locais

- `npx prisma validate` valida o schema Prisma;
- `npm run test:performance` protege os índices e limites essenciais no código;
- a medição real contra Supabase continua dependente da resolução de TLS registrada na Task 7.5.
