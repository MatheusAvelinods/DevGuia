// Trilhas (uma por tecnologia) e seus capítulos, montadas a partir do conteúdo.
import { getCollection } from 'astro:content';
import { categoriasDe } from './comandos';

export interface Capitulo {
  id: string;
  titulo: string;
  href: string;
}

export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  capitulos: Capitulo[];
  totalComandos: number;
  totalDestrutivos: number;
  hrefTutorial: string;
  hrefReferencia: string;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export async function todasTrilhas(): Promise<Trilha[]> {
  const [tecnologias, docs] = await Promise.all([getCollection('tecnologias'), getCollection('docs')]);
  const trilhas = await Promise.all(
    tecnologias
      .sort((a, b) => a.data.ordem - b.data.ordem)
      .map(async (tec) => {
        const capitulos = docs
          .filter((d) => d.id.startsWith(`${tec.id}/tutorial/`))
          .sort((a, b) => (a.data.sidebar.order ?? 99) - (b.data.sidebar.order ?? 99))
          .map((d) => ({ id: d.id, titulo: d.data.title, href: `${base}/${d.id}/` }));
        const comandos = (await categoriasDe(tec.id)).flatMap((c) => c.comandos);
        return {
          id: tec.id,
          nome: tec.data.nome,
          descricao: tec.data.descricao,
          capitulos,
          totalComandos: comandos.length,
          totalDestrutivos: comandos.filter((c) => c.destrutivo).length,
          hrefTutorial: `${base}/${tec.id}/tutorial/`,
          hrefReferencia: `${base}/${tec.id}/referencia/`,
        };
      }),
  );
  return trilhas;
}

/** Descobre a trilha pela URL (ex.: /DevGuia/git/... → "git"). */
export async function trilhaDaUrl(pathname: string): Promise<string | undefined> {
  const ids = (await getCollection('tecnologias')).map((t) => t.id);
  const caminho = pathname.slice(base.length);
  return ids.find((id) => caminho.startsWith(`/${id}/`));
}
