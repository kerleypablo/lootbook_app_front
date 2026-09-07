# Auditoria de ownership

## Regra

O cliente nunca envia o proprietário de uma ficha. O backend deriva o usuário exclusivamente do JWT autenticado em `request.user.id` e transmite esse valor até o repositório.

Uma ficha e todas as suas entidades filhas pertencem ao dono de `Character`. Uma operação de leitura ou mutação só pode atingir uma entidade quando `Character.userId` corresponde ao usuário autenticado.

## Cobertura revisada

| Área | Proteção |
| --- | --- |
| Personagens | `id + userId` em leitura, alteração e remoção |
| Stats, resources e notes | personagem validado por `id + userId` na transação antes da substituição |
| Items, actions e effects | personagem validado para criação/listagem; entidades filhas filtram também por `character.userId` para alteração/remoção |
| Links e recálculo | personagem filtrado por `id + userId`, inclusive ao carregar entradas do cálculo |
| Sheet e snapshots | personagem filtrado por `id + userId` antes de agregar ou criar versão |

As rotas da ficha usam `preHandler: app.authenticate`. As exceções são intencionais: `GET /health` é pública para monitoramento e `GET /templates` lista templates públicos, sem dados de usuário.

## Regra de resposta

Para não revelar se uma ficha existe para outro usuário, falta de ownership responde `404 CharacterNotFoundError`, igual a uma ficha inexistente. O contrato completo de erros está em [error-contract.md](./error-contract.md).

## Verificação contínua

`npm run test:ownership` verifica estaticamente que as rotas protegidas mantêm o middleware de autenticação e que cada repositório sensível preserva seu predicado de ownership. A execução integrada contra dois usuários continua coberta pela Task 7.5 quando o TLS local do Prisma for restabelecido.
