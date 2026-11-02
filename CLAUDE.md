# Projeto: DevGuia — guia de comandos (Git, Docker e mais)

Leia `docs/PRD.md` antes de qualquer tarefa.

## Stack
Astro + Starlight, TypeScript, Content Collections com Zod, Playwright, Vitest.
Publicado no GitHub Pages em https://matheusavelinods.github.io/DevGuia/ (`base: '/DevGuia'`).

## Comandos
- `npm run dev` — servidor local
- `npm run build` — gera `dist/` (falha se o conteúdo não passar no schema)
- `npm run check` — checagem de tipos (astro check)
- `npm run check:links` — links internos de `dist/` (rodar após o build)
- `npm test` — Vitest (inclui checagem do `dist/` se existir)

## Regras
- Conteúdo e interface em PT-BR.
- Comandos ficam só em `src/content/commands/<tec>/*.yaml`; nunca duplicar em MDX (usar `<ComandoRef>`).
- Todo comando destrutivo tem `destrutivo: true` e um `aviso`.
- Links internos em Markdown/MDX levam a base: `/DevGuia/...`.
- Rodar `npm run build` e `npm test` antes de concluir uma tarefa.
- Commits no padrão Conventional Commits.

## Modo de trabalho
- Explicar cada passo de forma didática antes de executar.
- Uma fase do roadmap por vez; parar ao fim de cada fase para revisão.
