// Gera dist/downloads/cheatsheet.html no build: arquivo único, CSS embutido, sem JavaScript.
import type { APIRoute } from 'astro';
import { montarCheatsheet } from '../../lib/cheatsheet';
import { gerarHtml } from '../../lib/cheatsheet-formatos';
import { metaCheatsheet } from '../../lib/cheatsheet-meta';

export const GET: APIRoute = async () =>
  new Response(gerarHtml(await montarCheatsheet(), metaCheatsheet()), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
