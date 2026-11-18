import { describe, expect, it } from 'vitest';
import type { TecnologiaCheatsheet } from '../src/lib/cheatsheet';
import { gerarHtml, gerarMarkdown, resumir } from '../src/lib/cheatsheet-formatos';
import { carregarCategorias } from '../scripts/ler-comandos.mjs';

const meta = { url: 'https://exemplo.github.io/DevGuia/', data: '18/11/2026' };
const dados: TecnologiaCheatsheet[] = [
  {
    id: 'git',
    nome: 'Git',
    categorias: [
      {
        slug: 'basico',
        nome: 'Básico',
        itens: [
          { id: 'a', comando: 'git status', resumo: 'Mostra o estado.', nivel: 'basico', destrutivo: false },
          {
            id: 'b',
            comando: 'git reset --hard <x>',
            resumo: 'Apaga tudo.',
            nivel: 'avancado',
            destrutivo: true,
          },
          {
            id: 'c',
            comando: 'echo $T | docker login',
            resumo: 'Login com | barra.',
            nivel: 'basico',
            destrutivo: false,
          },
        ],
      },
    ],
  },
];

describe('resumir', () => {
  it('fica com a primeira frase', () => {
    expect(resumir('Remove um container. A imagem continua.')).toBe('Remove um container.');
  });
  it('não corta em abreviações seguidas de minúscula', () => {
    expect(resumir('Ignora o cache (ex. para pegar atualizações).')).toBe(
      'Ignora o cache (ex. para pegar atualizações).',
    );
  });
});

describe('gerarMarkdown', () => {
  const md = gerarMarkdown(dados, meta);
  it('tem uma linha de tabela por comando, com aviso nos destrutivos', () => {
    const linhas = md.split('\n').filter((l) => l.startsWith('| `') || l.startsWith('| ``'));
    expect(linhas).toHaveLength(3);
    expect(linhas[1]).toContain('⚠️ Apaga tudo.');
  });
  it('escapa barras verticais para não quebrar a tabela', () => {
    expect(md).toContain('`echo $T \\| docker login`');
    expect(md).toContain('Login com \\| barra.');
  });
  it('cita a origem e a licença', () => {
    expect(md).toContain(meta.url);
    expect(md).toContain('CC BY 4.0');
  });
});

describe('gerarHtml', () => {
  const html = gerarHtml(dados, meta);
  it('é autocontido: sem CSS, script ou imagem externos', () => {
    expect(html).not.toMatch(/<link[^>]+stylesheet/i);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<img/i);
    expect(html).toMatch(/<style>/);
  });
  it('escapa o HTML dos comandos', () => {
    expect(html).toContain('<code>git reset --hard &lt;x&gt;</code>');
    expect(html).not.toContain('<x>');
  });
});

describe('resumos reais da cheat sheet', async () => {
  const comandos = (await carregarCategorias()).flatMap((c) => c.comandos);
  it.each(comandos.map((c) => [c.id, c] as const))('%s tem um resumo de uma linha', (_, c) => {
    const resumo = (c.resumo as string | undefined) ?? resumir(c.descricao as string);
    expect(resumo.length).toBeGreaterThanOrEqual(10);
    expect(resumo.length).toBeLessThanOrEqual(160);
    expect(resumo).toMatch(/[.)]$/);
  });
});
