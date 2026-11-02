// Verifica links internos do site gerado em dist/.
// Uso: node scripts/checar-links.mjs [pastaDist] [base]
// Sai com código 1 se encontrar algum link quebrado.
import { readdir, readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTR_RE = /\s(?:href|src)="([^"#?]+)[^"]*"/g;

async function listarHtml(dir) {
  const entradas = await readdir(dir, { withFileTypes: true, recursive: true });
  return entradas
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => path.join(e.parentPath, e.name));
}

function resolverAlvo(distDir, base, arquivoHtml, url) {
  if (/^(?:[a-z]+:)?\/\//i.test(url) || /^(?:mailto|tel|data|javascript):/i.test(url)) {
    return null; // link externo: fora do escopo deste verificador
  }
  let caminho;
  if (url.startsWith('/')) {
    if (!url.startsWith(base + '/') && url !== base) {
      return { url, motivo: `não começa com a base "${base}"` };
    }
    caminho = path.join(distDir, decodeURIComponent(url.slice(base.length)));
  } else {
    caminho = path.join(path.dirname(arquivoHtml), decodeURIComponent(url));
  }
  const candidatos = [caminho, path.join(caminho, 'index.html')];
  const existe = candidatos.some((c) => existsSync(c) && statSync(c).isFile());
  return existe ? null : { url, motivo: 'destino não existe' };
}

export async function checarLinks(distDir, base) {
  const quebrados = [];
  for (const arquivo of await listarHtml(distDir)) {
    const html = await readFile(arquivo, 'utf8');
    for (const [, url] of html.matchAll(ATTR_RE)) {
      const erro = resolverAlvo(distDir, base, arquivo, url);
      if (erro) quebrados.push({ pagina: path.relative(distDir, arquivo), ...erro });
    }
  }
  return quebrados;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const distDir = path.resolve(process.argv[2] ?? 'dist');
  const base = process.argv[3] ?? '/DevGuia';
  const quebrados = await checarLinks(distDir, base);
  if (quebrados.length) {
    console.error(`✗ ${quebrados.length} link(s) quebrado(s):`);
    for (const q of quebrados) console.error(`  ${q.pagina}: ${q.url} (${q.motivo})`);
    process.exit(1);
  }
  console.log('✓ Nenhum link interno quebrado.');
}
