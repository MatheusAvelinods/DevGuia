// Servidor estático mínimo que serve dist/ sob a base /DevGuia, como no GitHub Pages.
// Usado pelo gerador de PDF e pelos testes no navegador.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.wasm': 'application/wasm',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
};

/** @returns {Promise<{ url: string, fechar: () => Promise<void> }>} */
export async function servirDist(dist = 'dist', base = '/DevGuia') {
  const raiz = path.resolve(dist);
  const servidor = createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (!url.startsWith(base + '/')) return void res.writeHead(404).end();
    let arquivo = path.join(raiz, url.slice(base.length));
    if (!arquivo.startsWith(raiz)) return void res.writeHead(403).end();
    if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = path.join(arquivo, 'index.html');
    if (!existsSync(arquivo)) return void res.writeHead(404).end();
    res.writeHead(200, { 'content-type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream' });
    createReadStream(arquivo).pipe(res);
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  const { port } = /** @type {import('node:net').AddressInfo} */ (servidor.address());
  return {
    url: `http://127.0.0.1:${port}${base}/`,
    fechar: () => new Promise((ok) => servidor.close(() => ok())),
  };
}
