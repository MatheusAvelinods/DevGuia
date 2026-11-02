# DevGuia

Guia em português de comandos **Git**, **Docker** e mais: tutoriais para
aprender o fluxo e uma referência rápida para achar e copiar o comando certo —
com aviso quando ele é destrutivo.

🔗 **Site:** https://matheusavelinods.github.io/DevGuia/

## Stack

| Camada    | Escolha                                                                   |
| --------- | ------------------------------------------------------------------------- |
| Framework | [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) |
| Conteúdo  | MDX (tutoriais) + YAML (comandos)                                         |
| Validação | Zod (Content Collections)                                                 |
| Busca     | Pagefind (gerada no build, sem servidor)                                  |
| Testes    | Vitest (+ Playwright a partir da Fase 3)                                  |
| Deploy    | GitHub Actions → GitHub Pages                                             |

## Rodando localmente

```bash
npm ci
npm run dev          # http://localhost:4321/DevGuia/
npm run build        # gera dist/
npm run lint         # ESLint + Prettier
npm test             # schema, regras e verificador de links
npm run check:links  # links e âncoras internos de dist/ (após o build)
npm run test:e2e     # navegador: páginas, filtro, copiar e busca (após o build)
```

## Estrutura

```
.github/workflows/   ci.yml (todo PR) e deploy.yml (push na main)
scripts/              utilitários (links, contagem, leitura dos YAML)
src/content/commands/ comandos em YAML — fonte única da referência e da busca
src/content/docs/     tutoriais e páginas (Markdown/MDX)
src/components/       CardComando, ListaComandos, ComandoRef, Dica, Aviso
src/lib/              schema Zod e validações dos comandos
src/pages/            página de referência gerada por tecnologia
tests/                Vitest (unidade) e tests/e2e (Playwright)
docs/PRD.md          documento de requisitos
```

## Roadmap

- [x] **Fase 0 · Fundação** — Astro + Starlight, CI e deploy no Pages
- [x] **Fase 1 · Git** — schema de comandos, componentes, tutorial (8 capítulos) e 74 comandos
- [ ] **Fase 2 · Docker** — tutorial e 60+ comandos
- [ ] **Fase 3 · Cheat sheet** — página única + downloads em PDF, Markdown e HTML
- [ ] **Fase 4 · Pós-MVP** — receitas, snippets de configuração, novas trilhas

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

Código sob [MIT](LICENSE). Conteúdo sob [CC BY 4.0](LICENSE-CONTENT).
