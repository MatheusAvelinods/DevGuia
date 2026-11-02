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
npm run build && npm run check:links && npm test
```

## Adicionar ou corrigir um comando

> O formato YAML dos comandos chega na Fase 1. Este passo a passo será
> detalhado quando o schema estiver pronto.

1. Edite o arquivo da categoria em `src/content/commands/<tecnologia>/<categoria>.yaml`.
2. Rode `npm run dev` e confira o comando na página de referência.
3. Se o comando apaga dados ou reescreve histórico, marque `destrutivo: true` e escreva um `aviso`.
4. Abra um PR.

## Corrigir um tutorial

Os tutoriais ficam em `src/content/docs/<tecnologia>/tutorial/`. Cada página
tem o link "Editar página" no rodapé, que abre o arquivo direto no GitHub.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
`feat:`, `fix:`, `docs:`, `chore:`, `ci:`…

## Licenças

Ao contribuir, você concorda que o código fica sob MIT e o conteúdo sob CC BY 4.0.
