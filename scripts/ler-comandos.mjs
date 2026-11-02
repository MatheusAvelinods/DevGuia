// Lê os YAML de src/content/commands/<tecnologia>/<categoria>.yaml direto do disco
// (fora do Astro): usado por testes e pelos scripts de contagem/cheat sheet.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

/** @returns {Promise<Array<{ tecnologia: string, slug: string, arquivo: string, dados: unknown, comandos: any[] }>>} */
export async function carregarCategorias(pasta = 'src/content/commands') {
  const categorias = [];
  for (const tecnologia of (await readdir(pasta, { withFileTypes: true })).filter((d) => d.isDirectory())) {
    const dir = path.join(pasta, tecnologia.name);
    for (const nome of (await readdir(dir)).filter((n) => n.endsWith('.yaml')).sort()) {
      const arquivo = path.join(dir, nome);
      const dados = parse(await readFile(arquivo, 'utf8'));
      categorias.push({
        tecnologia: tecnologia.name,
        slug: nome.replace(/\.yaml$/, ''),
        arquivo,
        dados,
        comandos: Array.isArray(dados?.comandos) ? dados.comandos : [],
      });
    }
  }
  return categorias;
}
