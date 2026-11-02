# PRD — DevGuia: guia de comandos Git, Docker e mais

_Nov 2, 2026 · @Matheus Avelino_

## Visão geral e viabilidade

O projeto é viável: um site de documentação estático, gerado a partir de Markdown e publicado de graça no GitHub Pages via GitHub Actions. Não precisa de servidor, banco de dados nem custo mensal.

**Problema.** Comandos de Git, Docker e afins ficam espalhados entre docs oficiais extensas, posts e anotações pessoais. Na hora do uso, o que se quer é o comando certo, com um exemplo e um aviso quando ele é destrutivo.

**Proposta.** Um guia em PT-BR com duas camadas: tutoriais didáticos (aprender) e uma referência rápida de comandos com busca e botão de copiar (consultar). Uma página "cheat sheet" reúne os principais comandos e pode ser baixada em PDF, HTML ou Markdown.

**Por que GitHub Pages serve:**

- Hospeda sites estáticos de repositórios públicos sem custo, com HTTPS e domínio próprio opcional.
- Deploy automático a cada push na `main` com um workflow do Actions.
- Limites documentados (aprox., confirmar na doc do GitHub): site até 1 GB e cerca de 100 GB/mês de banda — muito acima do que um guia de texto consome.
- O repositório vira peça de portfólio: conteúdo, CI/CD, testes e contribuições visíveis.

**Restrição que molda o design:** não há backend. Busca, cheat sheet e downloads precisam ser gerados no build ou rodar no navegador.

## Objetivos, não-objetivos e métricas

O MVP precisa entregar Git e Docker completos, busca e download da cheat sheet; o resto cresce por adição de conteúdo, sem mudar a arquitetura.

**Objetivos**

1. Encontrar e copiar qualquer comando coberto em menos de 10 segundos.
2. Ensinar o fluxo, não só a sintaxe: cada tecnologia tem um tutorial do zero ao uso diário.
3. Permitir consulta offline com um arquivo único baixável.
4. Facilitar contribuição: adicionar um comando = editar um arquivo YAML e abrir um PR.
5. Servir de portfólio: código limpo, CI com testes, README e CONTRIBUTING claros.

**Não-objetivos (por enquanto)**

- Login, contas, favoritos sincronizados ou qualquer backend.
- Terminal interativo ou execução de comandos no navegador.
- Cobrir a documentação oficial inteira: o foco são os comandos de uso real.
- Tradução para outros idiomas no MVP (a arquitetura deve permitir depois).

**Métricas de sucesso**

| Métrica | Meta | Como medir |
| --- | --- | --- |
| Comandos cobertos no MVP | ≥ 60 Git + ≥ 60 Docker | contagem nos YAML (script no CI) |
| Lighthouse (performance, acessibilidade, SEO) | ≥ 95 em cada | Lighthouse CI no PR |
| Tamanho da página inicial | < 200 KB transferidos | Lighthouse / DevTools |
| Links quebrados | 0 | link checker no CI |
| Contribuições externas | primeiro PR de terceiros em até 3 meses | GitHub Insights |
| Uso | visitas e downloads da cheat sheet | analytics sem cookies (opcional, ex.: GoatCounter) |

## Público-alvo e personas

O usuário principal é o próprio autor; se o guia for bom para consulta diária dele, serve à comunidade.

| Persona | Contexto | O que precisa | Onde vai no site |
| --- | --- | --- | --- |
| Autor (dev/analista) | Usa Git e Docker no dia a dia, esquece flags | Achar e copiar rápido, cheat sheet offline | Busca, referência, download |
| Iniciante / estudante | Primeiro contato com versionamento e containers | Explicação passo a passo, conceitos, erros comuns | Tutoriais |
| Dev intermediário | Sabe o básico, trava em casos específicos (rebase, volumes, redes) | Receitas por problema: "como desfazer X" | Seção Receitas |
| Contribuidor | Quer adicionar comandos ou corrigir erros | Formato simples e validado | CONTRIBUTING + YAML |

## Requisitos funcionais

Prioridade P0 = MVP obrigatório; P1 = logo após o MVP; P2 = futuro.

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF01 | Página inicial com cards por tecnologia (Git, Docker, depois outras) e busca em destaque | P0 |
| RF02 | Tutorial por tecnologia: conceitos, instalação, configuração inicial, fluxo do dia a dia, erros comuns | P0 |
| RF03 | Referência de comandos por tecnologia, agrupada por categoria (ex.: Git → Configuração, Branches, Histórico, Desfazer, Remoto) | P0 |
| RF04 | Cada comando mostra: sintaxe, descrição curta, exemplo, flags principais e nível (básico/intermediário/avançado) | P0 |
| RF05 | Botão "copiar" em todo bloco de código, com feedback visual "Copiado!" | P0 |
| RF06 | Alerta visual em comandos destrutivos (ex.: `git reset --hard`, `docker system prune -a`) com o que se perde e como evitar | P0 |
| RF07 | Busca global full-text, funcionando sem servidor, com atalho de teclado (`/` ou `Ctrl+K`) | P0 |
| RF08 | Página Cheat Sheet: todos os comandos P0 numa página única, compacta, agrupada por tecnologia e categoria | P0 |
| RF09 | Download da cheat sheet em PDF (gerado no CI), Markdown e HTML autocontido | P0 |
| RF10 | Tema claro/escuro com detecção do sistema | P0 |
| RF11 | Seção Receitas: problemas reais com solução ("desfazer o último commit sem perder alterações", "limpar imagens órfãs") | P1 |
| RF12 | Cheat sheet filtrável antes de baixar (escolher tecnologias e nível) | P1 |
| RF13 | Link "editar esta página no GitHub" e "reportar erro" (abre issue com template) | P1 |
| RF14 | Snippets de configuração prontos: `.gitconfig`, `.gitignore`, `Dockerfile`, `docker-compose.yml`, `.dockerignore` | P1 |
| RF15 | Novas trilhas: Linux/Bash, Docker Compose avançado, Kubernetes básico, SSH, ferramentas de segurança (Nmap etc.) | P2 |
| RF16 | Funcionar offline após a primeira visita (PWA) | P2 |
| RF17 | Versão em inglês (i18n) | P2 |

**Detalhe do download (RF08–RF09).** A cheat sheet é gerada no build a partir dos mesmos YAML da referência, nunca escrita à mão. O CI publica três arquivos junto ao site:

- `cheatsheet.pdf` — A4, duas colunas, gerado com Playwright a partir da página com CSS de impressão.
- `cheatsheet.md` — Markdown puro, bom para guardar no repositório pessoal ou no Obsidian.
- `cheatsheet.html` — arquivo único com CSS embutido, abre offline em qualquer navegador.

Também há um botão "Imprimir" (`window.print()`) com folha de estilo própria, que funciona sem depender do PDF.

## Requisitos não-funcionais

| ID | Categoria | Requisito |
| --- | --- | --- |
| RNF01 | Performance | Página estática, JS só onde necessário (busca, copiar, tema); LCP < 1,5 s em 4G |
| RNF02 | Acessibilidade | WCAG 2.1 AA: contraste, navegação por teclado, foco visível, `aria-label` nos botões de copiar |
| RNF03 | Responsivo | Uso confortável a partir de 360 px; blocos de código com rolagem horizontal própria |
| RNF04 | SEO | Título e descrição por página, sitemap, Open Graph; URLs legíveis (`/git/desfazer/`) |
| RNF05 | Qualidade do conteúdo | YAML validado por schema no CI; build falha se faltar campo obrigatório |
| RNF06 | Segurança | Sem dependências de terceiros carregadas em runtime; Dependabot ativo; sem segredos no repositório |
| RNF07 | Privacidade | Sem cookies; analytics, se houver, sem rastreamento pessoal |
| RNF08 | Manutenção | Adicionar uma tecnologia nova não exige mudar código, só criar arquivos de conteúdo |
| RNF09 | Licença | Código MIT; conteúdo CC BY 4.0 (permite reuso com crédito) |

## Arquitetura e stack

A escolha é Astro com o tema Starlight: ele já entrega menu lateral, busca offline, tema escuro, botão de copiar código e link "editar no GitHub", deixando o esforço para o conteúdo e para os recursos próprios (cartão de comando e cheat sheet).

Fluxo de conteúdo: **Comandos (YAML, `src/content/commands/`)** + **Tutoriais (MDX, `src/content/docs/`)** → **Build Astro** (Content Collections valida YAML com Zod, renderiza o MDX, gera a cheat sheet) → **GitHub Pages**: site estático, índice de busca (Pagefind) e downloads da cheat sheet (`.pdf`, `.md`, `.html`).

Comandos e tutoriais são a única fonte; referência, busca e cheat sheet são derivadas no build, então nunca ficam desatualizadas entre si.

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Framework | Astro + Starlight | Feito para documentação, gera HTML estático, quase zero JS |
| Linguagem | TypeScript | Tipagem dos dados de comando, bom para portfólio |
| Conteúdo | MDX (tutoriais) + YAML (comandos) | Texto livre onde se ensina, dado estruturado onde se consulta |
| Validação | Zod (Content Collections) | Build falha se um comando estiver incompleto |
| Busca | Pagefind (embutido no Starlight) | Índice gerado no build, roda no navegador |
| Blocos de código | Expressive Code (embutido) | Destaque de sintaxe, botão copiar, marcação de linhas |
| PDF | Playwright no CI | Renderiza a página da cheat sheet com CSS de impressão |
| Testes | Vitest (scripts) + Playwright (smoke test das páginas) | Garante que geração de downloads e páginas principais funcionam |

Alternativas consideradas: Docusaurus (React, mais pesado), MkDocs Material (excelente, mas em Python) e HTML/JS puro (mais trabalho para busca, menu e tema).

**Estrutura de pastas**

```
devguia/
├── .github/
│   ├── workflows/ci.yml
│   ├── workflows/deploy.yml
│   └── ISSUE_TEMPLATE/
├── scripts/
│   ├── gerar-cheatsheet.mjs   # gera .md e .html
│   └── gerar-pdf.mjs          # Playwright -> .pdf
├── src/
│   ├── content/
│   │   ├── docs/              # tutoriais MDX (git/, docker/)
│   │   └── commands/          # YAML por tecnologia e categoria
│   ├── components/            # CardComando, ListaComandos, ComandoRef, Aviso
│   ├── pages/cheatsheet.astro
│   ├── styles/print.css
│   └── content.config.ts      # schemas Zod
├── tests/
├── astro.config.mjs           # site + base do GitHub Pages
├── CLAUDE.md                  # contexto para o Claude Code
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

Adicionar uma tecnologia nova = criar `src/content/docs/<tec>/` e `src/content/commands/<tec>/` e registrar no menu. Nenhum componente muda.

## Estrutura de conteúdo

Toda tecnologia segue o mesmo esqueleto de quatro partes, para o usuário saber onde procurar em qualquer trilha: Tutorial, Referência, Receitas e Configurações.

| Tecnologia | Tutorial (capítulos) | Categorias da referência |
| --- | --- | --- |
| Git | 1. O que é versionamento · 2. Instalação e `git config` · 3. Primeiro repositório · 4. Branches e merge · 5. Trabalhando com remoto (GitHub) · 6. Desfazendo coisas · 7. Rebase e histórico limpo · 8. Fluxo de trabalho em equipe (PR, Conventional Commits) | Configuração · Básico · Branches · Merge e rebase · Histórico e inspeção · Desfazer · Stash · Remoto · Tags · Avançado |
| Docker | 1. Containers vs VMs · 2. Instalação · 3. Primeiro container · 4. Imagens e Dockerfile · 5. Volumes e persistência · 6. Redes · 7. Docker Compose · 8. Boas práticas e segurança (usuário não-root, imagens slim, multi-stage) | Imagens · Containers · Logs e inspeção · Volumes · Redes · Build · Compose · Limpeza · Registry |

**Modelo de um comando (YAML).** Cada categoria é um arquivo; cada comando, um item. Esse arquivo alimenta a referência, a busca e a cheat sheet.

```yaml
# src/content/commands/git/desfazer.yaml
categoria: Desfazer
ordem: 6
comandos:
  - id: git-reset-soft
    comando: git reset --soft HEAD~1
    descricao: Desfaz o último commit e mantém as alterações em stage.
    exemplo: |
      git reset --soft HEAD~1
      git status   # arquivos continuam prontos para commit
    nivel: intermediario       # basico | intermediario | avancado
    destrutivo: false
    cheatsheet: true           # entra na página para download
    tags: [commit, desfazer, reset]
    relacionados: [git-reset-hard, git-revert]
  - id: git-reset-hard
    comando: git reset --hard HEAD~1
    descricao: Apaga o último commit e todas as alterações não commitadas.
    nivel: intermediario
    destrutivo: true
    aviso: Alterações locais são perdidas. Prefira git revert em branches compartilhadas.
    cheatsheet: true
    tags: [commit, desfazer, reset]
```

**Modelo de tutorial (MDX).** Cada capítulo segue a ordem: objetivo do capítulo → conceito em linguagem simples → passo a passo com comandos → "o que pode dar errado" → resumo com links para a referência. Componentes MDX reutilizáveis: `<Passo>`, `<Aviso>`, `<Dica>`, `<ComandoRef id="git-reset-soft" />` (puxa o comando do YAML, evitando duplicação).

## UX/UI

O layout é o de documentação clássica — cabeçalho com busca, menu lateral e índice da página — porque o público já sabe usá-lo sem aprender nada.

**Layout**

- Cabeçalho fixo: logo, busca (`Ctrl+K`), link do GitHub, alternador de tema.
- Barra lateral esquerda: tecnologias → Tutorial / Referência / Receitas / Configurações; recolhe em menu no celular.
- Coluna direita: índice da página atual ("nesta página").
- Rodapé: editar no GitHub, reportar erro, licença.

**Componente "cartão de comando"** (o elemento mais usado do site):

- Linha 1: o comando em fonte monoespaçada + botão copiar à direita.
- Linha 2: descrição curta.
- Selo de nível (básico/intermediário/avançado) e selo vermelho "destrutivo" quando aplicável, com o aviso visível sem precisar clicar.
- Exemplo expansível e links para comandos relacionados.

**Página de referência:** filtros por nível e por "só destrutivos" no topo; categorias como âncoras para links diretos (`/git/referencia/#desfazer`).

**Cheat Sheet:** visual denso em duas ou três colunas, sem exemplos longos, só comando + descrição de uma linha. Três botões no topo: Baixar PDF · Baixar Markdown · Baixar HTML, mais Imprimir.

**Didática visual:** cores com significado fixo — azul = dica, amarelo = atenção, vermelho = destrutivo — e diagramas simples nos tutoriais (ex.: áreas do Git: working directory → staging → repositório → remoto).

## Deploy, CI/CD e contribuição

Dois workflows do GitHub Actions: um valida todo PR, outro publica no Pages a cada push na `main`.

**Workflow `ci.yml` (em todo PR)**

1. Instalar dependências (`npm ci`).
2. Validar os YAML contra o schema (Zod via Content Collections).
3. Lint (ESLint, Prettier, markdownlint).
4. Build do site.
5. Checar links quebrados.
6. Lighthouse CI com metas mínimas (≥ 95).

**Workflow `deploy.yml` (push na `main`)**

1. Build do site.
2. Gerar `cheatsheet.pdf` com Playwright e `cheatsheet.md` / `cheatsheet.html` com um script Node.
3. Copiar os três arquivos para `dist/downloads/`.
4. Publicar com `actions/upload-pages-artifact` + `actions/deploy-pages`.

**Configuração no GitHub:** Settings → Pages → Source = GitHub Actions. URL final: `https://matheusavelinods.github.io/<nome-do-repo>/` (o `base` do Astro precisa apontar para `/<nome-do-repo>`). Domínio próprio é opcional.

**Contribuição da comunidade**

- `CONTRIBUTING.md` com o passo a passo para adicionar um comando (editar YAML → rodar `npm run dev` → abrir PR).
- Templates de issue: "Comando errado", "Sugerir comando", "Sugerir tecnologia".
- Template de PR com checklist (testei o comando, marquei se é destrutivo, rodei o build).
- Labels `good first issue` para atrair os primeiros contribuidores.
- Branch `main` protegida: merge só com CI verde.

## Roadmap e plano no Claude Code

O MVP sai em quatro fases, cada uma terminando com um site publicado e funcionando; nenhuma fase deixa o projeto quebrado.

| Fase | Entrega | Gate |
| --- | --- | --- |
| 0 · Fundação | Repositório, Astro + Starlight, base do Pages, deploy.yml e ci.yml, README e licenças | Site vazio publicado na URL do GitHub Pages |
| 1 · Git | Schema Zod dos comandos, CardComando e ListaComandos, tutorial Git (8 capítulos), 60+ comandos | Busca encontra qualquer comando Git; Lighthouse 95+ |
| 2 · Docker | Tutorial Docker (8 capítulos), 60+ comandos, avisos de comandos destrutivos revisados | Conteúdo do MVP completo e revisado |
| 3 · Cheat sheet e downloads | Página única, CSS de impressão, scripts que geram PDF, Markdown e HTML no deploy | **Lançamento v1.0: MVP público** |
| 4 · Pós-MVP | Receitas, snippets de configuração, templates de contribuição, novas trilhas (Linux, SSH, Kubernetes) | — |

Começar por Git antes de Docker valida o schema e os componentes com uma tecnologia; a segunda vira só trabalho de conteúdo.

**Como iniciar no Claude Code**

1. Crie o repositório vazio no GitHub e clone localmente.
2. Baixe este PRD como Markdown e salve em `docs/PRD.md` no repositório.
3. Abra o Claude Code na pasta e peça para criar o `CLAUDE.md` a partir do PRD.
4. Trabalhe uma fase por vez, cada fase em uma branch e um PR; só avance quando o gate estiver cumprido.
5. Ao fim de cada fase, peça ao Claude Code para explicar o que foi feito e por quê — isso vira aprendizado e material para o README.

**Prompts iniciais sugeridos por fase**

- Fase 0: "Leia o PRD e monte a Fase 0: projeto Astro + Starlight configurado para GitHub Pages, com ci.yml e deploy.yml. Explique cada arquivo criado."
- Fase 1: "Implemente o schema Zod de comandos e os componentes CardComando e ListaComandos. Crie o YAML de Git categoria por categoria, começando por Configuração."
- Fase 2: "Replique a estrutura de Git para Docker, sem alterar componentes."
- Fase 3: "Crie a página /cheatsheet e os scripts que geram PDF, Markdown e HTML no deploy."

**Questões em aberto**

- Nome do projeto e do repositório ("DevGuia" é provisório); define a URL final.
- Domínio próprio ou URL do github.io?
- Usar analytics sem cookies ou nenhum?
- Revisão técnica: quem confere os comandos antes do v1.0 além do autor?
