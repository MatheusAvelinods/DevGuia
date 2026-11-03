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
