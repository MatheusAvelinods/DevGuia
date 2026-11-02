// Funções puras sobre os comandos: usadas no build (via astro:content)
// e nos testes/scripts (lendo os YAML direto do disco).
import type { CategoriaDados, Comando } from './schema-comandos';

export interface Categoria extends CategoriaDados {
  /** Tecnologia, tirada da pasta (ex.: "git"). */
  tecnologia: string;
  /** Slug da categoria, tirado do nome do arquivo (ex.: "desfazer"). Vira âncora. */
  slug: string;
}

export interface ComandoIndexado extends Comando {
  tecnologia: string;
  categoria: string;
  categoriaSlug: string;
}

/** "git/desfazer" → { tecnologia: "git", slug: "desfazer" } */
export function separarId(entryId: string) {
  const partes = entryId.replace(/\.ya?ml$/, '').split('/');
  if (partes.length !== 2) {
    throw new Error(`Arquivo de comandos fora do padrão <tecnologia>/<categoria>.yaml: "${entryId}"`);
  }
  return { tecnologia: partes[0], slug: partes[1] };
}

export function ordenarCategorias(categorias: Categoria[]) {
  return [...categorias].sort((a, b) => a.ordem - b.ordem || a.slug.localeCompare(b.slug));
}

export function indexarComandos(categorias: Categoria[]): ComandoIndexado[] {
  return ordenarCategorias(categorias).flatMap((cat) =>
    cat.comandos.map((c) => ({
      ...c,
      tecnologia: cat.tecnologia,
      categoria: cat.categoria,
      categoriaSlug: cat.slug,
    })),
  );
}

/**
 * Validações que cruzam arquivos (o schema Zod só enxerga um arquivo por vez):
 * ids únicos, `relacionados` existentes, ordem de categoria única por tecnologia.
 */
export function validarComandos(categorias: Categoria[]): string[] {
  const erros: string[] = [];
  const onde = new Map<string, string>();

  for (const cat of categorias) {
    for (const c of cat.comandos) {
      const local = `${cat.tecnologia}/${cat.slug}.yaml`;
      const anterior = onde.get(c.id);
      if (anterior) erros.push(`id duplicado "${c.id}" em ${local} (já existe em ${anterior})`);
      else onde.set(c.id, local);
    }
  }

  for (const cat of categorias) {
    for (const c of cat.comandos) {
      for (const rel of c.relacionados) {
        if (rel === c.id) erros.push(`"${c.id}" lista a si mesmo em relacionados`);
        else if (!onde.has(rel))
          erros.push(`"${c.id}" (${cat.tecnologia}/${cat.slug}.yaml) relaciona "${rel}", que não existe`);
      }
    }
  }

  const ordens = new Map<string, string>();
  for (const cat of categorias) {
    const chave = `${cat.tecnologia}#${cat.ordem}`;
    const outra = ordens.get(chave);
    if (outra) erros.push(`ordem ${cat.ordem} repetida em ${cat.tecnologia}: "${outra}" e "${cat.slug}"`);
    else ordens.set(chave, cat.slug);
  }

  return erros;
}
