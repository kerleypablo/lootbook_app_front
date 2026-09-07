# Ficha agregada e snapshots

`GET /characters/:id/sheet` e a leitura principal da ficha para o frontend. A rota exige o JWT do usuario e retorna `404` quando a ficha nao existe ou nao pertence ao usuario autenticado.

## Contrato de leitura

A resposta possui o formato abaixo:

```json
{
  "sheet": {
    "character": {},
    "stats": [],
    "resources": [],
    "items": [],
    "actions": [],
    "effects": [],
    "links": [],
    "notes": [],
    "derivedState": {},
    "latestSnapshot": null
  }
}
```

As entidades preservam os mesmos formatos das rotas de seus respectivos modulos. A lista vem em ordem estavel: stats, resources e notes por chave/secao; itens por equipado e nome; actions por nome; effects e links por criacao. Isso evita que o frontend precise ordenar a ficha para exibi-la de forma previsivel.

`derivedState` e calculado no momento da leitura a partir dos dados base, links e efeitos ativos. Ele nunca altera stats ou resources persistidos. Assim, uma alteracao recente da ficha aparece imediatamente, mesmo antes de um novo snapshot.

## Snapshots

`POST /characters/:id/recalculate` continua retornando o estado derivado em `state` e agora tambem retorna o snapshot salvo:

```json
{
  "state": {},
  "snapshot": {
    "id": "uuid",
    "version": 1,
    "derivedStateJson": {},
    "createdAt": "2026-09-07T00:00:00.000Z"
  }
}
```

Cada recalculo bem-sucedido grava uma nova versao sequencial do estado derivado. `latestSnapshot` na ficha agregada aponta para a ultima versao persistida, ou e `null` enquanto nenhum recalculo foi solicitado. A leitura `GET /sheet` nao cria snapshots nem causa mutacao.

## Custo de leitura

O agregador concentra a leitura em uma unica operacao de dominio, sem chamadas fragmentadas do frontend. As relacoes da ficha ja possuem indice por `characterId`; `characters.userId` protege a busca do agregado por ownership. A busca recupera apenas os campos expostos e somente o snapshot mais recente.
