// Gera dist/downloads/cheatsheet.md no build.
import type { APIRoute } from 'astro';
import { montarCheatsheet } from '../../lib/cheatsheet';
import { gerarMarkdown } from '../../lib/cheatsheet-formatos';
import { metaCheatsheet } from '../../lib/cheatsheet-meta';

export const GET: APIRoute = async () =>
  new Response(gerarMarkdown(await montarCheatsheet(), metaCheatsheet()), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
