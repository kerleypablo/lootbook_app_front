# Lootbook Frontend Architecture Rules

Este documento define a arquitetura oficial do projeto. Ele deve ser seguido por qualquer pessoa ou IA que criar, mover ou alterar páginas, componentes, hooks, estado, utilitários, estilos ou assets.

Objetivo:
- manter o projeto consistente
- evitar código espalhado em lugares errados
- impedir que `app/` vire um depósito genérico
- preservar uma estrutura moderna de `Next.js + React + TypeScript`

## 1. Princípios Gerais

1. `app/` existe para roteamento e composição de páginas/layouts.
2. `features/` existe para domínio, fluxo, regras de negócio, estado e UI específica de cada área.
3. `shared/` existe apenas para código realmente reutilizável entre features.
4. Componentes devem ficar próximos do domínio ao qual pertencem.
5. Lógica repetida deve sair de páginas/componentes e ir para hooks ou utils.
6. Estilo visual deve ficar preferencialmente em `CSS Modules`, não em `className` longos.
7. `use client` deve existir apenas onde realmente há interatividade, animação, estado local ou uso de APIs do browser.
8. Nome de arquivo, pasta e componente deve refletir claramente a responsabilidade real.

## 2. Estrutura Oficial

```txt
src/
  app/
    layout.tsx
    globals.css
    page.tsx
    characters/
      new/
        layout.tsx
        race/page.tsx
        class/page.tsx
        attribute/page.tsx

  features/
    home/
      components/
      data/

    character-builder/
      components/
      data/
      hooks/
      state/
      utils/
      types.ts

  shared/
    components/
      layout/
```

## 3. Regras de Cada Camada

### `src/app`

Usar para:
- `page.tsx`
- `layout.tsx`
- definição de rotas do Next
- composição de features

Não usar para:
- guardar componentes de domínio
- guardar hooks de feature
- guardar utils de feature
- guardar estado de feature

Regra prática:
- um arquivo em `app/` deve importar e montar a feature certa
- a regra é: `app` organiza a navegação, `features` implementa o comportamento

Exemplo correto:

```tsx
import HomeScreen from "@/features/home/components/HomeScreen";

export default function Home() {
  return <HomeScreen />;
}
```

### `src/features`

Usar para tudo que pertence a uma feature específica.

Exemplos:
- `features/home`
- `features/character-builder`

Cada feature deve concentrar:
- componentes próprios
- dados próprios
- hooks próprios
- estado próprio
- utils próprios
- tipos próprios

Regra:
- se um arquivo pertence claramente a uma única feature, ele não deve ir para `shared`

### `src/shared`

Usar apenas para elementos realmente reaproveitáveis entre múltiplas features.

Exemplos válidos:
- `Header`
- `BottomNav`

Não colocar em `shared`:
- cards específicos do builder
- navegação específica do fluxo de criação
- componentes que só fazem sentido dentro de uma feature

## 4. Regras Para Novos Componentes

### Componentes de feature

Criar em:
- `src/features/<feature>/components/<ComponentName>.tsx`
- `src/features/<feature>/components/<ComponentName>.module.css`

Exemplo:

```txt
src/features/character-builder/components/OptionCard.tsx
src/features/character-builder/components/OptionCard.module.css
```

### Componentes compartilhados

Criar em:
- `src/shared/components/<grupo>/<ComponentName>.tsx`
- `src/shared/components/<grupo>/<ComponentName>.module.css`

### Regras

1. Todo componente visual relevante deve ter seu próprio `CSS Module`.
2. Evitar colocar layout fino em `className` com muitas utilities.
3. Preferir classes semânticas como:
   - `header`
   - `profileGroup`
   - `contentFrame`
   - `cardTitle`
4. Inline style só deve existir quando o valor for dinâmico de verdade.

Exemplo aceitável de inline:

```tsx
style={{ backgroundColor: accentColor, top: shadowTop }}
```

Exemplo não recomendado:

```tsx
className="mt-[4px] flex-shrink-0 overflow-hidden rounded-full"
```

Neste caso, preferir:

```tsx
className={styles.profileAvatar}
```

## 5. Regras Para CSS

Padrão oficial:
- usar `CSS Modules` por componente
- manter `globals.css` apenas para estilos globais reais

### `globals.css`

Pode conter:
- reset/global baseline
- variáveis globais
- estilos do `body`
- tipografia base
- utilidades globais realmente universais

Não deve conter:
- estilos específicos de um único componente
- estilos de uma única feature
- CSS morto de bibliotecas não usadas

### `*.module.css`

Deve conter:
- layout local do componente
- spacing
- alinhamento
- estados visuais
- tamanhos
- ajustes de responsividade do componente

## 6. Regras Para Hooks

Criar hooks quando houver:
- lógica repetida entre telas/componentes
- estado derivado não trivial
- comportamento específico de uma feature

Local:
- `src/features/<feature>/hooks`

Exemplos atuais:
- `usePointBuy`
- `useSelectionHighlight`
- `useStepAvailability`

Regras:
1. Hook de feature fica dentro da feature.
2. Hook compartilhado só vai para `shared` se for realmente genérico.
3. Hook deve encapsular comportamento, não apenas renomear `useState`.

## 7. Regras Para Estado

Estado de domínio deve ficar na feature.

Local:
- `src/features/<feature>/state`

Exemplos atuais:
- `CharacterBuilderContext`
- `BuilderStepContext`

Regras:
1. Não criar `context` de feature dentro de `app/`.
2. Providers devem ficar próximos da feature.
3. Estado de fluxo, wizard ou builder pertence à feature correspondente.
4. Se o estado crescer e começar a ter muitas transições, considerar `useReducer`.

## 8. Regras Para Utils

Local:
- `src/features/<feature>/utils`
- ou `src/shared/utils` se for realmente genérico

Regras:
1. Não duplicar utilitário dentro de componente.
2. Se duas partes usam a mesma lógica, extrair.
3. Utils devem ser pequenas, puras e previsíveis.

Exemplo correto:
- `features/character-builder/utils/getDominantColor.ts`

## 9. Regras Para Tipos e Dados

### Tipos

Tipos da feature devem ficar dentro da própria feature.

Local:
- `src/features/<feature>/types.ts`
- ou `src/features/<feature>/types/` se crescer bastante

### Dados

Mocks, catálogos e constantes da feature devem ficar em:
- `src/features/<feature>/data`

Exemplos:
- `races.ts`
- `classes.ts`
- `bonuses.ts`

Não colocar dados mockados diretamente dentro do componente, salvo teste rápido local e temporário.

## 10. Regras Para Páginas

As páginas de `app/` devem ser finas.

Uma página deve:
- importar a feature
- montar a composição
- delegar a lógica complexa para componentes/hooks

Uma página não deve:
- concentrar regra de negócio demais
- repetir lógica que já existe em outra rota
- carregar UI gigante inline se isso puder virar componente da feature

## 11. Regras Sobre `use client`

Padrão:
- componentes server por padrão
- client apenas onde necessário

Usar `use client` quando houver:
- `useState`
- `useEffect`
- `usePathname`
- eventos do usuário
- animações com `framer-motion`
- APIs do browser

Não usar `use client`:
- em página/layout só por conveniência
- em arquivos que só compõem componentes

Regra prática:
- empurrar a fronteira client para baixo na árvore

## 12. Regras de Naming

### Arquivos e componentes

1. Nome deve refletir a responsabilidade.
2. Evitar nomes ambíguos.
3. Não usar nomes que descrevem implementação errada.

Exemplos corretos:
- `OptionCard`
- `BuilderStepFooter`
- `CharacterBuilderLayoutClient`
- `SelectionHighlight`

Exemplos ruins:
- nomes genéricos demais
- nomes antigos que já não representam o uso atual
- nomes com typo

### CSS Modules

Sempre parear com o nome do componente:

```txt
Header.tsx
Header.module.css
```

## 13. Regras de Dependências

Antes de adicionar biblioteca nova:
1. confirmar se o projeto já não resolve isso com o que existe
2. evitar dependências redundantes
3. evitar múltiplas libs para a mesma função

Se uma lib deixar de ser usada:
- remover do código
- remover do `package.json`
- limpar CSS e tipos associados

## 14. Checklist Obrigatório Para Qualquer Mudança

Antes de considerar uma tarefa pronta, verificar:

1. O arquivo foi criado na camada certa?
2. O componente está na feature certa ou realmente precisa ser `shared`?
3. A página ficou fina ou recebeu lógica demais?
4. Existe duplicação que deveria virar hook ou util?
5. O estilo foi para `CSS Module` em vez de poluir o JSX?
6. O nome do arquivo representa claramente a responsabilidade?
7. O `use client` está no menor ponto possível?
8. A mudança manteve consistência com a estrutura existente?

## 15. Regras de Revisão Para IA

Ao trabalhar neste projeto, a IA deve seguir estas decisões:

1. Nunca criar novos componentes de domínio dentro de `src/app`.
2. Nunca criar pasta genérica tipo `src/app/components` para código novo.
3. Sempre preferir `CSS Module` para layout e visual de componentes.
4. Sempre extrair lógica repetida para `hooks` ou `utils`.
5. Sempre manter estado de feature dentro de `features/<feature>/state`.
6. Sempre questionar se algo é realmente `shared` antes de colocá-lo em `shared/`.
7. Sempre manter páginas e layouts do `app` como composição, não como implementação principal.
8. Sempre evitar regressão para uma arquitetura “misturada”.

## 16. Regra Final

Se houver dúvida sobre onde colocar um arquivo novo, usar esta ordem de decisão:

1. Isso pertence claramente a uma feature?
   - então vai para `features/<feature>/...`
2. Isso é usado por múltiplas features e é realmente genérico?
   - então vai para `shared/...`
3. Isso é apenas rota/layout/composição do Next?
   - então vai para `app/...`

Se a resposta não estiver clara, o padrão preferido deste projeto é:
- favorecer `features/` em vez de espalhar código em `app/`

