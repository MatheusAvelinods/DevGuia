// Gera dist/downloads/cheatsheet.pdf a partir da página /cheatsheet/ já construída,
// usando o CSS de impressão dela (A4, duas colunas). Roda depois do `astro build`.
// Uso: node scripts/gerar-pdf.mjs [pastaDist]
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { servirDist } from './servir-dist.mjs';

const dist = path.resolve(process.argv[2] ?? 'dist');
const destino = path.join(dist, 'downloads', 'cheatsheet.pdf');

const servidor = await servirDist(dist);
const navegador = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
);
try {
  // Tema claro forçado: o PDF sai igual para todo mundo.
  const contexto = await navegador.newContext({ colorScheme: 'light' });
  await contexto.addInitScript(() => localStorage.setItem('starlight-theme', 'light'));
  const pagina = await contexto.newPage();
  const resposta = await pagina.goto(`${servidor.url}cheatsheet/`, { waitUntil: 'networkidle' });
  if (!resposta?.ok()) throw new Error(`/cheatsheet/ respondeu ${resposta?.status()}`);

  await mkdir(path.dirname(destino), { recursive: true });
  await pagina.pdf({
    path: destino,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;padding:0 11mm;font:7pt system-ui,sans-serif;color:#777;display:flex;justify-content:space-between">
      <span>DevGuia — Cheat Sheet · matheusavelinods.github.io/DevGuia</span>
      <span>página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  });
  const { size } = await stat(destino);
  console.log(`✓ ${path.relative(process.cwd(), destino)} (${Math.round(size / 1024)} KB)`);
} finally {
  await navegador.close();
  await servidor.fechar();
}
