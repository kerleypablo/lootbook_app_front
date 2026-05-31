# Lootbook Product Vision

## 1. O que e o Lootbook

Lootbook e uma ficha digital configuravel para RPG de mesa.

A ideia central do produto e substituir a ficha de papel por uma ficha online:
- flexivel
- editavel
- estruturada
- com automacoes opcionais

O app nao existe para ensinar a regra completa de um sistema especifico. Ele existe para ajudar o jogador a registrar, organizar, atualizar e usar sua ficha durante o jogo com menos trabalho manual.

## 2. Proposta Central do Produto

O Lootbook deve permitir que o usuario:
- crie e mantenha sua ficha de personagem
- registre atributos, recursos, itens, armas, magias, poderes e anotacoes
- acompanhe a evolucao do personagem ao longo da campanha
- configure vinculos entre partes da ficha
- automatize calculos simples e recorrentes

Em vez de ser uma implementacao fechada de um sistema, o Lootbook deve ser um motor de ficha digital generico com suporte a templates de sistema no futuro.

## 3. Posicionamento do Produto

O produto sera orientado por estes principios:

1. Generico por design
O Lootbook nao sera hardcoded em D&D, Tormenta20 ou qualquer outro sistema.

2. Template-driven
No futuro, o app podera oferecer templates de sistema como:
- D&D 5e
- Tormenta20
- Blank / Custom

3. O usuario conhece a regra
O app nao precisa ter toda a progressao oficial cadastrada para ser util. O jogador pode usar o livro ou a regra que ja conhece e registrar no app aquilo que o personagem ganhou, escolheu ou modificou.

4. Automacao opcional
O app ajuda, mas nao prende o usuario em um fluxo rigido. A ficha continua sendo livre o suficiente para diferentes estilos de mesa e diferentes sistemas.

## 4. Casos de Uso Principais

O Lootbook deve atender principalmente estes cenarios:

### Criacao e manutencao da ficha
- criar um personagem
- definir nome, retrato, nivel e template base
- registrar atributos e recursos
- adicionar anotacoes gerais e informacoes de lore

### Registro de conteudo jogavel
- cadastrar armas, armaduras, equipamentos e inventario
- cadastrar magias, poderes, tecnicas e acoes
- registrar efeitos ativos e passivos
- registrar status, usos por descanso, pontos, cargas e consumiveis

### Evolucao do personagem
- atualizar a ficha ao subir de nivel
- adicionar o que o personagem ganhou
- alterar atributos, recursos e equipamentos
- registrar novas acoes, poderes e efeitos

### Uso durante a sessao
- consultar rapidamente a ficha
- acompanhar recursos atuais e maximos
- ver informacoes importantes sem fazer contas manuais
- usar vinculos e automacoes para reduzir erros

## 5. Modelo Conceitual do Produto

O produto sera construido em tres camadas de flexibilidade:

### 5.1. Ficha livre

A ficha deve permitir:
- texto livre
- anotacoes
- campos customizados
- organizacao por secoes

Essa camada garante que o app continue util mesmo quando uma regra ou opcao nao estiver modelada estruturalmente.

### 5.2. Dados estruturados

A ficha tambem deve ter partes estruturadas para permitir calculos, filtros e agregacoes:
- atributos
- recursos
- itens
- acoes
- efeitos
- links

Essa camada e a base da automacao.

### 5.3. Links e automacoes

O usuario podera relacionar elementos da ficha para automatizar comportamentos.

Exemplos:
- uma arma usa FOR ou DES para compor o ataque
- um item aumenta defesa ou capacidade de carga
- um efeito soma bonus em um atributo
- um recurso e consumido ao usar uma acao
- o peso total do inventario e recalculado a partir dos itens cadastrados

## 6. Escopo da V1

A V1 do Lootbook sera deliberadamente focada.

### Inclui
- ficha individual do usuario
- autenticacao de usuario
- criacao e edicao de personagens
- armazenamento de dados livres e estruturados
- cadastro manual de stats, recursos, itens, acoes, efeitos e anotacoes
- links e automacoes simples
- leitura agregada da ficha para uso no app

### Nao inclui
- campanha multiplayer
- gerenciamento completo de mesa
- banco completo de regras oficiais
- progressao automatica completa de D&D, Tormenta20 ou outro sistema
- linguagem livre de formulas complexas
- homebrew engine totalmente aberta logo de inicio

## 7. Principios de Produto

### Flexivel
O usuario nao deve ficar bloqueado por falta de um campo fixo.

### Agnostico de sistema
O core do app deve servir a diferentes sistemas e estilos de mesa.

### Automacao opcional
O usuario pode usar a ficha apenas como registro digital ou ir adicionando automacoes gradualmente.

### Estruturado sem engessar
O app deve equilibrar campos livres com dados modelados.

### Simplicidade antes de complexidade de regra
Na V1, o app precisa resolver bem o uso real da ficha, nao modelar toda a profundidade de um sistema oficial.

### Performance e clareza
O uso principal e em sessao, entao leitura rapida e interface confiavel sao mais importantes do que excessos de configuracao no primeiro momento.

## 8. Resultado Esperado da V1

Ao final da primeira versao, o Lootbook deve ser percebido como:

> uma ficha digital generica de RPG com suporte a registro livre, dados estruturados e automacoes simples para reduzir trabalho manual durante o jogo

Se essa proposta estiver bem implementada, o produto fica pronto para depois evoluir com:
- templates mais ricos de sistema
- recursos compartilhados de campanha
- automacoes mais avancadas
- importacao de conteudo e presets
