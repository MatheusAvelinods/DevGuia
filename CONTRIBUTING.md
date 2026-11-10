# Como contribuir

Obrigado por ajudar o DevGuia! Todo o conteúdo é em **português (PT-BR)**.

## Rodando localmente

```bash
git clone https://github.com/MatheusAvelinods/DevGuia.git
cd DevGuia
npm ci
npm run dev        # abre em http://localhost:4321/DevGuia/
```

Antes de abrir o PR:

```bash
npm run lint && npm run build && npm test
```

## Adicionar ou corrigir um comando

Cada categoria é um arquivo YAML em `src/content/commands/<tecnologia>/<categoria>.yaml`;
cada comando é um item da lista `comandos`. O mesmo arquivo alimenta a referência, a busca
e a cheat sheet.

```yaml
- id: git-reset-soft # único no site; só minúsculas, números e hífens
  comando: git reset --soft HEAD~1 # o que o botão "copiar" copia
  descricao: Desfaz o último commit e mantém as alterações em stage.
  exemplo: | # opcional, pode ter várias linhas
    git reset --soft HEAD~1
    git status
  flags: # opcional
    - flag: --soft
      descricao: Mantém as mudanças em stage.
  nivel: intermediario # basico | intermediario | avancado
  destrutivo: false # true se apaga dados ou reescreve histórico
  aviso: '...' # obrigatório quando destrutivo: o que se perde e como evitar
  cheatsheet: true # entra na cheat sheet (padrão: true)
  tags: [commit, desfazer]
  relacionados: [git-reset-hard, git-revert] # ids de outros comandos
```

Passo a passo:

1. Edite o YAML da categoria (ou crie um novo com `categoria`, `ordem` e `comandos`).
2. Rode `npm run dev` e confira o comando em `/<tecnologia>/referencia/`.
3. Teste o comando de verdade num terminal.
4. Rode `npm run build && npm test` e abra o PR.

Se algo estiver errado, o build falha com uma mensagem dizendo o arquivo e o campo — por
exemplo, um comando destrutivo sem `aviso` ou um `relacionados` que aponta para um id inexistente.

> **Dica:** se um texto tiver `: ` (dois-pontos seguido de espaço), coloque-o entre aspas.

## Corrigir ou escrever um tutorial

Os tutoriais ficam em `src/content/docs/<tecnologia>/tutorial/` (MDX). Cada página tem o link
"Editar página" no rodapé. Cada capítulo segue: **objetivo → conceito → passo a passo → o que
pode dar errado → resumo**.

Componentes disponíveis:

```mdx
import ComandoRef from '../../../../components/ComandoRef.astro';
import Quiz from '../../../../components/Quiz.astro';
import Dica from '../../../../components/Dica.astro';
import Aviso from '../../../../components/Aviso.astro';
import { Steps } from '@astrojs/starlight/components';

<ComandoRef id="git-reset-soft" /> {/* mostra o comando do YAML, sem duplicar */}
<Dica>texto em azul</Dica>
<Aviso>texto em amarelo</Aviso>
<Aviso destrutivo>texto em vermelho</Aviso>
```

Todo capítulo termina com uma seção `## Teste rápido` (um `<Quiz>`) antes do `## Resumo`.
Trechos entre crases nas opções viram código.

Links internos levam a base do site: `/DevGuia/git/referencia/#desfazer`.

## Adicionar uma tecnologia

1. Adicione uma entrada em `src/content/tecnologias.yaml`.
2. Crie `src/content/commands/<tec>/` com os YAML e `src/content/docs/<tec>/tutorial/`.
3. Registre no menu em `astro.config.mjs`.

A página `/<tec>/referencia/` é gerada automaticamente — nenhum componente muda.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
`feat:`, `fix:`, `docs:`, `chore:`, `ci:`…

## Licenças

Ao contribuir, você concorda que o código fica sob MIT e o conteúdo sob CC BY 4.0.
