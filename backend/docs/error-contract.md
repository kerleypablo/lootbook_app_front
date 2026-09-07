# Contrato de erros da API

Todo endpoint que retorna erro usa o mesmo formato:

```json
{
  "statusCode": 404,
  "error": "CharacterNotFoundError",
  "message": "Character not found",
  "details": { "characterId": "uuid" },
  "requestId": "req-1"
}
```

`error` e um codigo estável para o frontend tratar. `message` é uma explicação segura para exibição ou log. `details` contém contexto de domínio ou a lista de problemas de validação e é `null` quando não há detalhes. `requestId` deve ser informado ao suporte ao investigar uma falha.

| Situação | HTTP | `error` |
| --- | --- | --- |
| Payload, parâmetro ou query inválidos | 400 | `ValidationError` |
| Erro nativo de requisição do Fastify | 4xx | `RequestError` |
| Token ausente, inválido ou expirado | 401 | `AuthenticationError` |
| Credencial autenticada sem requisito de domínio | 422 | `AuthenticationError` |
| Rota ou recurso não encontrado, inclusive ficha sem ownership | 404 | `NotFoundError` ou código específico, como `CharacterNotFoundError` |
| Regra de domínio inválida | 400 | código específico, como `InvalidLinkError` |
| Configuração ou falha inesperada | 500 | `ConfigurationError` ou `InternalServerError` |

Erros internos não expõem stack trace, mensagens do banco ou segredos. O frontend deve usar o status HTTP e `error` para decidir o fluxo; não deve depender do texto de `message`.
