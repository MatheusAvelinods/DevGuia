import { describe, expect, it } from 'vitest';
import { carregarCategorias } from '../scripts/ler-comandos.mjs';
import { type Categoria, separarId, validarComandos } from '../src/lib/comandos-core';
import { categoriaSchema, comandoSchema } from '../src/lib/schema-comandos';

const base = { id: 'git-x', comando: 'git x', descricao: 'Faz alguma coisa útil.', nivel: 'basico' };

describe('schema de comando', () => {
  it('aceita o mínimo e preenche os padrões', () => {
    const c = comandoSchema.parse(base);
    expect(c).toMatchObject({ destrutivo: false, cheatsheet: true, tags: [], relacionados: [], flags: [] });
  });

  it('exige aviso em comando destrutivo', () => {
    const r = comandoSchema.safeParse({ ...base, destrutivo: true });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(['aviso']);
    expect(comandoSchema.safeParse({ ...base, destrutivo: true, aviso: 'Perde tudo.' }).success).toBe(true);
  });

  it('recusa id fora do padrão e nível inválido', () => {
    expect(comandoSchema.safeParse({ ...base, id: 'Git X' }).success).toBe(false);
    expect(comandoSchema.safeParse({ ...base, nivel: 'expert' }).success).toBe(false);
  });
});

describe('validarComandos (regras entre arquivos)', () => {
  const cat = (slug: string, ordem: number, comandos: object[]): Categoria => ({
    ...categoriaSchema.parse({ categoria: slug, ordem, comandos }),
    tecnologia: 'git',
    slug,
  });

  it('acusa id duplicado, relacionado inexistente e ordem repetida', () => {
    const erros = validarComandos([
      cat('a', 1, [{ ...base, relacionados: ['git-nao-existe'] }]),
      cat('b', 1, [base]),
    ]);
    expect(erros).toHaveLength(3);
    expect(erros.join('\n')).toMatch(/id duplicado "git-x"/);
    expect(erros.join('\n')).toMatch(/relaciona "git-nao-existe"/);
    expect(erros.join('\n')).toMatch(/ordem 1 repetida/);
  });

  it('separarId tira tecnologia e categoria do caminho', () => {
    expect(separarId('git/desfazer')).toEqual({ tecnologia: 'git', slug: 'desfazer' });
    expect(() => separarId('desfazer')).toThrow();
  });
});

describe('conteúdo real em src/content/commands', async () => {
  const brutas = await carregarCategorias();

  it.each(brutas.map((b) => [b.arquivo, b] as const))('%s passa no schema', (_, b) => {
    const r = categoriaSchema.safeParse(b.dados);
    expect(r.success, r.error?.message).toBe(true);
  });

  it('não tem erros entre arquivos', () => {
    const categorias = brutas.map((b) => ({
      ...categoriaSchema.parse(b.dados),
      tecnologia: b.tecnologia,
      slug: b.slug,
    }));
    expect(validarComandos(categorias)).toEqual([]);
  });
});
