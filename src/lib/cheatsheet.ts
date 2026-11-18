// Dados da cheat sheet: os comandos com `cheatsheet: true`, agrupados por
// tecnologia e categoria, na mesma ordem da referência. Fonte única para a
// página /cheatsheet/ e para os downloads (.md, .html e .pdf).
import { getCollection } from 'astro:content';
import { todasCategorias } from './comandos';
import { resumir } from './cheatsheet-formatos';
import type { Nivel } from './schema-comandos';

export interface ItemCheatsheet {
  id: string;
  comando: string;
  resumo: string;
  nivel: Nivel;
  destrutivo: boolean;
}

export interface CategoriaCheatsheet {
  slug: string;
  nome: string;
  itens: ItemCheatsheet[];
}

export interface TecnologiaCheatsheet {
  id: string;
  nome: string;
  categorias: CategoriaCheatsheet[];
}

export async function montarCheatsheet(): Promise<TecnologiaCheatsheet[]> {
  const [tecnologias, categorias] = await Promise.all([getCollection('tecnologias'), todasCategorias()]);
  return tecnologias
    .sort((a, b) => a.data.ordem - b.data.ordem)
    .map((tec) => ({
      id: tec.id,
      nome: tec.data.nome,
      categorias: categorias
        .filter((c) => c.tecnologia === tec.id)
        .map((c) => ({
          slug: c.slug,
          nome: c.categoria,
          itens: c.comandos
            .filter((cmd) => cmd.cheatsheet)
            .map((cmd) => ({
              id: cmd.id,
              comando: cmd.comando,
              resumo: cmd.resumo ?? resumir(cmd.descricao),
              nivel: cmd.nivel,
              destrutivo: cmd.destrutivo,
            })),
        }))
        .filter((c) => c.itens.length > 0),
    }))
    .filter((t) => t.categorias.length > 0);
}

export function totalItens(dados: TecnologiaCheatsheet[]) {
  return dados.reduce((n, t) => n + t.categorias.reduce((m, c) => m + c.itens.length, 0), 0);
}
