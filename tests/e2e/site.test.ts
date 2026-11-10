// Smoke test do site gerado: abre páginas num navegador real e testa a busca.
// Pré-requisito: `npm run build`. Rodar com `npm run test:e2e`.
import { existsSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { carregarCategorias } from '../../scripts/ler-comandos.mjs';
import { servirDist } from './servidor';

if (!existsSync('dist/index.html')) {
  throw new Error('dist/ não encontrado — rode `npm run build` antes de `npm run test:e2e`.');
}

let browser: Browser;
let page: Page;
let servidor: Awaited<ReturnType<typeof servirDist>>;

beforeAll(async () => {
  servidor = await servirDist();
  browser = await chromium.launch(
    process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  );
  page = await browser.newPage();
});

afterAll(async () => {
  await browser?.close();
  await servidor?.fechar();
});

interface Resultado {
  url: string;
  sub: string[];
}

/** Usa a mesma API do Pagefind que a caixa de busca do site usa. */
async function buscar(termo: string): Promise<Resultado[]> {
  // Código em string: o Vite não pode reescrever o import() que roda no navegador.
  return page.evaluate(`(async () => {
    const pagefind = await import('/DevGuia/pagefind/pagefind.js');
    const { results } = await pagefind.search(${JSON.stringify(termo)});
    const dados = await Promise.all(results.slice(0, 5).map((r) => r.data()));
    return dados.map((d) => ({ url: d.url, sub: d.sub_results.map((s) => s.url) }));
  })()`);
}

describe('páginas principais', () => {
  it.each([
    ['', 'DevGuia'],
    ['git/tutorial/', 'Tutorial de Git'],
    ['git/tutorial/desfazendo-coisas/', '6. Desfazendo coisas'],
    ['git/referencia/', 'Referência de Git'],
    ['docker/tutorial/', 'Tutorial de Docker'],
    ['docker/tutorial/docker-compose/', '7. Docker Compose'],
    ['docker/referencia/', 'Referência de Docker'],
    ['treino/', 'Modo Treino'],
  ])('/%s abre com o título "%s"', async (caminho, titulo) => {
    const resp = await page.goto(servidor.url + caminho);
    expect(resp?.status()).toBe(200);
    await expect(page.locator('h1').first().textContent()).resolves.toContain(titulo);
  });

  it('referência: filtro "só destrutivos" esconde os demais', async () => {
    await page.goto(servidor.url + 'git/referencia/');
    const total = await page.locator('.cmd').count();
    await page.getByLabel('Só destrutivos').check();
    const visiveis = await page.locator('.cmd:visible').count();
    const destrutivos = await page.locator('.cmd[data-destrutivo="sim"]').count();
    expect(visiveis).toBe(destrutivos);
    expect(visiveis).toBeLessThan(total);
  });

  it('botão copiar coloca o comando na área de transferência', async () => {
    const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await ctx.newPage();
    await p.goto(servidor.url + 'git/referencia/#git-reset-soft');
    const card = p.locator('.cmd', { has: p.locator('#git-reset-soft') });
    await card.hover();
    await card.locator('.copy button').first().click();
    expect(await p.evaluate(() => navigator.clipboard.readText())).toBe('git reset --soft HEAD~1');
    await ctx.close();
  });
});

describe('recursos interativos', () => {
  // Cada teste usa um contexto novo: o progresso (localStorage) começa vazio.
  const novaPagina = async () => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const erros: string[] = [];
    p.on('pageerror', (e) => erros.push(e.message));
    return { p, ctx, erros };
  };

  it('concluir capítulo marca o menu e aparece no progresso da página inicial', async () => {
    const { p, ctx, erros } = await novaPagina();
    await p.goto(servidor.url + 'git/tutorial/desfazendo-coisas/');
    await p.getByRole('button', { name: 'Marcar como concluído' }).click();
    await expect(p.getByRole('button', { name: 'Concluído!' }).getAttribute('aria-pressed')).resolves.toBe(
      'true',
    );
    await expect(p.locator('.sidebar-content a.dg-concluido').count()).resolves.toBe(1);

    await p.goto(servidor.url);
    const git = p.getByRole('progressbar', { name: 'Progresso na trilha Git' });
    await expect(git.getAttribute('aria-valuenow')).resolves.toBe('1');
    await expect(
      p.getByRole('link', { name: 'Continuar de onde parei' }).first().getAttribute('href'),
    ).resolves.toMatch(/\/git\/tutorial\/o-que-e-versionamento\/$/);
    expect(erros).toEqual([]);
    await ctx.close();
  });

  it('modo treino: joga uma rodada inteira pelo teclado e registra recorde', async () => {
    const { p, ctx, erros } = await novaPagina();
    await p.goto(servidor.url + 'treino/');
    await p.getByLabel('Git').check();
    await p.getByRole('button', { name: /Começar rodada/ }).click();
    const comandos: { comando: string; descricao: string }[] = await p.evaluate(() =>
      fetch('/DevGuia/comandos.json').then((r) => r.json()),
    );
    for (let i = 0; i < 10; i++) {
      const descricao = await p.locator('[data-descricao]').textContent();
      const certo = comandos.find((c) => c.descricao === descricao)!.comando;
      const opcoes = await p.locator('.opcao code').allTextContents();
      expect(opcoes).toHaveLength(4);
      expect(opcoes).toContain(certo);
      await p.keyboard.press(String(opcoes.indexOf(certo) + 1));
      await expect(p.locator('.opcao.correta').count()).resolves.toBe(1);
      await p.keyboard.press('Enter');
    }
    await expect(p.locator('[data-fim-titulo]').textContent()).resolves.toBe('10 de 10 acertos');
    await expect(p.locator('[data-novo-recorde]').isVisible()).resolves.toBe(true);
    expect(erros).toEqual([]);
    await ctx.close();
  });

  it('teste rápido: responder mostra a explicação', async () => {
    const { p, ctx, erros } = await novaPagina();
    await p.goto(servidor.url + 'docker/tutorial/primeiro-container/');
    const quiz = p.locator('[data-quiz]');
    await quiz.getByRole('button', { name: /localhost:8080/ }).click();
    await expect(quiz.locator('[data-veredito]').textContent()).resolves.toContain('Isso aí');
    await expect(quiz.locator('.opcao.correta').count()).resolves.toBe(1);
    expect(erros).toEqual([]);
    await ctx.close();
  });

  it('diagramas interativos respondem aos botões', async () => {
    const { p, ctx, erros } = await novaPagina();
    await p.goto(servidor.url + 'git/tutorial/o-que-e-versionamento/');
    const git = p.locator('[data-areas-git]');
    for (const acao of ['editar', 'add', 'commit', 'push'])
      await git.locator(`[data-acao="${acao}"]`).click();
    await expect(git.locator('[data-area="remoto"] .chip').count()).resolves.toBe(1);

    await p.goto(servidor.url + 'docker/tutorial/primeiro-container/');
    const ciclo = p.locator('[data-ciclo]');
    for (const acao of ['run', 'gravar', 'stop', 'rm']) await ciclo.locator(`[data-acao="${acao}"]`).click();
    await expect(ciclo.locator('[data-narracao]').textContent()).resolves.toContain('se perdeu');
    expect(erros).toEqual([]);
    await ctx.close();
  });
});

describe('busca: encontra qualquer comando e leva à âncora dele na referência', async () => {
  const comandos = (await carregarCategorias('src/content/commands')).flatMap((cat) =>
    cat.comandos.map((c) => ({ tecnologia: cat.tecnologia, id: c.id, comando: c.comando })),
  );

  beforeAll(async () => {
    await page.goto(servidor.url);
  });

  it.each(comandos.map((c) => [c.id, c] as const))('%s', async (_, { tecnologia, id, comando }) => {
    const resultados = await buscar(comando);
    const subResultados = resultados.flatMap((r) => r.sub);
    expect(
      subResultados.some((u) => u.endsWith(`/${tecnologia}/referencia/#${id}`)),
      subResultados.join('\n'),
    ).toBe(true);
  });
});
