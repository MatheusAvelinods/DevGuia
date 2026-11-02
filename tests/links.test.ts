import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checarLinks } from '../scripts/checar-links.mjs';

function criarSite(arquivos: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), 'devguia-'));
  for (const [rel, conteudo] of Object.entries(arquivos)) {
    const alvo = path.join(dir, rel);
    mkdirSync(path.dirname(alvo), { recursive: true });
    writeFileSync(alvo, conteudo);
  }
  return dir;
}

describe('checarLinks', () => {
  it('aceita links válidos com base, relativos e externos', async () => {
    const dir = criarSite({
      'index.html': '<a href="/DevGuia/git/">git</a><a href="sobre/">s</a><a href="https://x.com">x</a>',
      'git/index.html': '<a href="/DevGuia/#topo">home</a>',
      'sobre/index.html': '',
    });
    expect(await checarLinks(dir, '/DevGuia')).toEqual([]);
  });

  it('acusa destino inexistente e link sem a base', async () => {
    const dir = criarSite({
      'index.html': '<a href="/DevGuia/nao-existe/">x</a><a href="/git/">y</a>',
      'git/index.html': '',
    });
    const quebrados = await checarLinks(dir, '/DevGuia');
    expect(quebrados.map((q) => q.url)).toEqual(['/DevGuia/nao-existe/', '/git/']);
  });
});

describe.skipIf(!existsSync('dist'))('site gerado (dist/)', () => {
  it('não tem links internos quebrados', async () => {
    expect(await checarLinks(path.resolve('dist'), '/DevGuia')).toEqual([]);
  });

  it('gera as páginas principais', () => {
    for (const pagina of ['index.html', 'git/tutorial/index.html', 'docker/tutorial/index.html', '404.html']) {
      expect(existsSync(path.join('dist', pagina)), pagina).toBe(true);
    }
  });
});
