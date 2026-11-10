// Todos os comandos em JSON, gerado no build. Usado pelo comando aleatório
// da página inicial e pelo Modo Treino (baixado só quando a pessoa usa).
import type { APIRoute } from 'astro';
import { todosComandos, urlComando } from '../lib/comandos';

export const GET: APIRoute = async () => {
  const comandos = (await todosComandos()).map((c) => ({
    id: c.id,
    comando: c.comando,
    descricao: c.descricao,
    tecnologia: c.tecnologia,
    categoria: c.categoria,
    nivel: c.nivel,
    destrutivo: c.destrutivo,
    aviso: c.aviso,
    url: urlComando(c),
  }));
  return new Response(JSON.stringify(comandos), { headers: { 'content-type': 'application/json' } });
};
