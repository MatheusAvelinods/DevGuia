// Servidor estático mínimo que serve dist/ sob a base /DevGuia, como no GitHub Pages.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.wasm': 'application/wasm',
};

export async function servirDist(dist = 'dist', base = '/DevGuia') {
  const raiz = path.resolve(dist);
  const servidor: Server = createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (!url.startsWith(base + '/')) {
      res.writeHead(404).end();
      return;
    }
    let arquivo = path.join(raiz, url.slice(base.length));
    if (!arquivo.startsWith(raiz)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = path.join(arquivo, 'index.html');
    if (!existsSync(arquivo)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream' });
    createReadStream(arquivo).pipe(res);
  });
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok));
  const { port } = servidor.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}${base}/`,
    fechar: () => new Promise<void>((ok) => servidor.close(() => ok())),
  };
}
