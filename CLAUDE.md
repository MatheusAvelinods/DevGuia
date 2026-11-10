# Projeto: DevGuia — guia de comandos (Git, Docker e mais)

Leia `docs/PRD.md` antes de qualquer tarefa.

## Stack

Astro + Starlight, TypeScript, Content Collections com Zod, Playwright, Vitest.
Publicado no GitHub Pages em https://matheusavelinods.github.io/DevGuia/ (`base: '/DevGuia'`).

## Onde fica cada coisa

- `src/content/commands/<tec>/<categoria>.yaml` — comandos (fonte única da referência, busca e cheat sheet)
- `src/content/tecnologias.yaml` — lista de tecnologias (gera `/<tec>/referencia/`)
- `src/content/docs/<tec>/tutorial/*.mdx` — tutoriais
- `src/lib/schema-comandos.ts` — schema Zod; `src/lib/comandos-core.ts` — validações entre arquivos
- `src/components/` — `CardComando`, `ListaComandos`, `ComandoRef`, `Dica`, `Aviso`, `Quiz`,
  `AreasGit` e `CicloContainer` (diagramas interativos), componentes da página inicial
  (`TerminalAnimado`, `CartoesTrilhas`, `ComandoAleatorio`, `ChamadaTreino`, `Destaques`) e `ConcluirCapitulo`
- `src/components/overrides/` — componentes do Starlight substituídos: `PageFrame` (cor da trilha
  via `data-trilha`), `Hero` (página inicial) e `Footer` (cartão "concluí este capítulo" + ✓ no menu)
- `src/styles/tema.css` — cores, cor por trilha, cartões, botões (`.dg-botao`) e animações
- `src/scripts/progresso.ts` — progresso e recordes no `localStorage` (sem cookies, sem servidor)
- `src/pages/[tecnologia]/referencia.astro` — página de referência gerada
- `src/pages/treino.astro` — Modo Treino; `src/pages/comandos.json.ts` — todos os comandos em JSON

## Comandos

- `npm run dev` — servidor local
- `npm run build` — gera `dist/` (falha se o conteúdo não passar no schema)
- `npm run lint` / `npm run format` — ESLint + Prettier
- `npm run check` — checagem de tipos (astro check)
- `npm run count` — contagem de comandos (mínimo por tecnologia)
- `npm test` — Vitest (schema, regras, verificador de links)
- `npm run check:links` e `npm run test:e2e` — rodar após o build

## Regras

- Conteúdo e interface em PT-BR.
- Comandos ficam só em `src/content/commands/<tec>/*.yaml`; nunca duplicar a ficha de um comando em MDX (usar `<ComandoRef id="..." />`). Sessões de terminal ilustrativas nos tutoriais são permitidas.
- Todo comando destrutivo tem `destrutivo: true` e um `aviso` (o schema exige).
- Textos YAML com `: ` (dois-pontos + espaço) precisam de aspas.
- Links internos em Markdown/MDX levam a base: `/DevGuia/...`.
- Cores com significado fixo: `<Dica>` azul, `<Aviso>` amarelo, `<Aviso destrutivo>` vermelho.
- Cada capítulo de tutorial termina com `## Teste rápido` (`<Quiz>`) antes do `## Resumo`.
- Componentes interativos funcionam sem JavaScript (conteúdo estático) e respeitam
  `prefers-reduced-motion`. Texto sobre cor precisa de contraste AA (4,5:1).
- Sem fontes web: elas custavam ~0,4 s de LCP no 4G simulado (meta do PRD: < 1,5 s).
  Títulos usam `--dg-font-titulo` e código `--dg-mono`, ambos fontes do sistema.
- Rodar `npm run lint`, `npm run build` e `npm test` antes de concluir uma tarefa.
- Commits no padrão Conventional Commits.

## Modo de trabalho

- Explicar cada passo de forma didática antes de executar.
- Uma fase do roadmap por vez; parar ao fim de cada fase para revisão.
