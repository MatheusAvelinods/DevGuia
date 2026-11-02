// Verifica links internos do site gerado em dist/.
// Uso: node scripts/checar-links.mjs [pastaDist] [base]
// Sai com código 1 se encontrar algum link quebrado.
import { readdir, readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTR_RE = /\s(?:href|src)="([^"]*)"/g;
const ID_RE = /\sid="([^"]+)"/g;

async function listarHtml(dir) {
  const entradas = await readdir(dir, { withFileTypes: true, recursive: true });
  return entradas
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => path.join(e.parentPath, e.name));
}

/** Separa "pagina/?q=1#ancora" em { caminho: "pagina/", ancora: "ancora" }. */
function separar(url) {
  const [semAncora, ancora = ''] = url.split('#');
  return { caminho: semAncora.split('?')[0], ancora: decodeURIComponent(ancora) };
}

function ehExterno(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url) || /^(?:mailto|tel|data|javascript):/i.test(url);
}

/** Resolve a URL para um arquivo em dist/. Retorna { arquivo } ou { motivo }. */
function resolverAlvo(distDir, base, arquivoHtml, url) {
  if (url === '') return { arquivo: arquivoHtml }; // "#ancora" na própria página
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
  const arquivo = candidatos.find((c) => existsSync(c) && statSync(c).isFile());
  return arquivo ? { arquivo } : { url, motivo: 'destino não existe' };
}

export async function checarLinks(distDir, base) {
  const quebrados = [];
  const arquivos = await listarHtml(distDir);
  const htmls = new Map();
  for (const arquivo of arquivos) htmls.set(arquivo, await readFile(arquivo, 'utf8'));

  const idsCache = new Map();
  const idsDe = (arquivo) => {
    if (!idsCache.has(arquivo)) {
      const html = htmls.get(arquivo) ?? '';
      idsCache.set(arquivo, new Set([...html.matchAll(ID_RE)].map((m) => m[1])));
    }
    return idsCache.get(arquivo);
  };

  for (const arquivo of arquivos) {
    const pagina = path.relative(distDir, arquivo);
    for (const [, bruto] of htmls.get(arquivo).matchAll(ATTR_RE)) {
      const url = bruto.replaceAll('&amp;', '&');
      if (ehExterno(url)) continue; // links externos: fora do escopo
      const { caminho, ancora } = separar(url);
      const alvo = resolverAlvo(distDir, base, arquivo, caminho);
      if (alvo.motivo) {
        quebrados.push({ pagina, url, motivo: alvo.motivo });
      } else if (
        ancora &&
        ancora !== '_top' &&
        alvo.arquivo.endsWith('.html') &&
        !idsDe(alvo.arquivo).has(ancora)
      ) {
        quebrados.push({ pagina, url, motivo: `âncora "#${ancora}" não existe no destino` });
      }
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
