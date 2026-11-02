// Acesso aos comandos durante o build do Astro.
import { getCollection } from 'astro:content';
import {
  type Categoria,
  type ComandoIndexado,
  indexarComandos,
  ordenarCategorias,
  separarId,
  validarComandos,
} from './comandos-core';

let cache: Promise<Categoria[]> | undefined;

async function carregar(): Promise<Categoria[]> {
  const entradas = await getCollection('commands');
  const categorias = entradas.map((e) => ({ ...e.data, ...separarId(e.id) }));
  const erros = validarComandos(categorias);
  if (erros.length) {
    throw new Error(`Comandos inválidos:\n- ${erros.join('\n- ')}`);
  }
  return ordenarCategorias(categorias);
}

export function todasCategorias() {
  cache ??= carregar();
  return cache;
}

export async function categoriasDe(tecnologia: string) {
  return (await todasCategorias()).filter((c) => c.tecnologia === tecnologia);
}

export async function todosComandos(): Promise<ComandoIndexado[]> {
  return indexarComandos(await todasCategorias());
}

export async function buscarComando(id: string): Promise<ComandoIndexado> {
  const c = (await todosComandos()).find((x) => x.id === id);
  if (!c) throw new Error(`<ComandoRef id="${id}" />: comando não encontrado nos YAML`);
  return c;
}

/** URL da ficha do comando na página de referência. */
export function urlComando(c: Pick<ComandoIndexado, 'tecnologia' | 'id'>) {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${c.tecnologia}/referencia/#${c.id}`;
}
