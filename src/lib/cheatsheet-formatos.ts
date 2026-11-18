// Geradores dos downloads da cheat sheet. Funções puras (sem Astro), testadas
// em tests/cheatsheet.test.ts.
import type { TecnologiaCheatsheet } from './cheatsheet';

export interface MetaCheatsheet {
  /** URL pública do site, ex.: https://matheusavelinods.github.io/DevGuia/ */
  url: string;
  /** data de geração, já formatada (ex.: 18/11/2026) */
  data: string;
}

/**
 * Primeira frase da descrição — "descrição de uma linha" do PRD.
 * Só corta em ". " seguido de letra maiúscula, para não quebrar abreviações
 * como "(ex. para ...)".
 */
export function resumir(descricao: string): string {
  const [primeira] = descricao.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/);
  return primeira.trim();
}

const ROTULO_NIVEL = { basico: 'básico', intermediario: 'intermediário', avancado: 'avançado' } as const;

const total = (dados: TecnologiaCheatsheet[]) =>
  dados.reduce((n, t) => n + t.categorias.reduce((m, c) => m + c.itens.length, 0), 0);

/* ------------------------------------------------------------------ Markdown */

/** Conteúdo de célula de tabela GFM: barras verticais precisam de escape, inclusive dentro de código. */
const celula = (texto: string) => texto.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Código inline que aguenta crases no conteúdo. */
const codigoInline = (texto: string) => {
  const maior = Math.max(0, ...(texto.match(/`+/g) ?? []).map((s) => s.length));
  const cerca = '`'.repeat(maior + 1);
  const espaco = texto.startsWith('`') || texto.endsWith('`') ? ' ' : '';
  return `${cerca}${espaco}${texto}${espaco}${cerca}`;
};

export function gerarMarkdown(dados: TecnologiaCheatsheet[], meta: MetaCheatsheet): string {
  const linhas: string[] = [
    '# DevGuia — Cheat Sheet',
    '',
    `> ${total(dados)} comandos de ${dados.map((t) => t.nome).join(' e ')}, gerados em ${meta.data} a partir de ${meta.url}`,
    '>',
    '> ⚠️ marca comandos destrutivos: leia o aviso na referência antes de usar.',
    '>',
    '> Conteúdo sob CC BY 4.0 — pode reusar, dando crédito.',
    '',
  ];
  for (const tec of dados) {
    linhas.push(`## ${tec.nome}`, '');
    for (const cat of tec.categorias) {
      linhas.push(`### ${cat.nome}`, '', '| Comando | O que faz |', '| --- | --- |');
      for (const item of cat.itens) {
        const aviso = item.destrutivo ? '⚠️ ' : '';
        linhas.push(`| ${celula(codigoInline(item.comando))} | ${aviso}${celula(item.resumo)} |`);
      }
      linhas.push('');
    }
  }
  return linhas.join('\n');
}

/* ---------------------------------------------------------------------- HTML */

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
:root{--fundo:#fff;--texto:#1d1f2b;--suave:#5c607a;--linha:#e3e5ee;--codigo:#f3f4f9;--git:#c2410c;--docker:#0b63b6;--perigo:#b91c1c;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--fundo:#11131f;--texto:#eceef6;--suave:#9095ad;--linha:#2a2e44;--codigo:#1c1f31;--git:#ff9b80;--docker:#7cc4ff;--perigo:#ff8a8a}}
*{box-sizing:border-box}
body{margin:0;padding:2rem clamp(1rem,4vw,3rem);background:var(--fundo);color:var(--texto);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{margin-bottom:1.5rem}
h1{margin:0;font-size:1.9rem;letter-spacing:-.02em}
.meta{margin:.3rem 0 0;color:var(--suave);font-size:.85rem}
.meta a{color:inherit}
h2{margin:2rem 0 .8rem;padding:.3rem .8rem;border-radius:.5rem;color:#fff;font-size:1.25rem;break-after:avoid}
h2.git{background:var(--git)}h2.docker{background:var(--docker)}h2.outra{background:#6d28d9}
@media (prefers-color-scheme:dark){h2.git,h2.docker{color:#11131f}}
.colunas{columns:3 18rem;column-gap:1.6rem}
section.cat{break-inside:avoid-column;margin:0 0 1.1rem}
h3{margin:0 0 .35rem;padding-bottom:.2rem;border-bottom:2px solid var(--linha);font-size:.95rem}
ul{margin:0;padding:0;list-style:none}
li{padding:.28rem 0;border-bottom:1px solid var(--linha);break-inside:avoid}
code{display:inline-block;padding:.05rem .35rem;border-radius:.3rem;background:var(--codigo);font:600 .82rem/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow-wrap:anywhere}
.resumo{display:block;margin-top:.1rem;color:var(--suave);font-size:.8rem}
.perigo{color:var(--perigo);font-weight:700}
footer{margin-top:2rem;color:var(--suave);font-size:.8rem}
@media print{
  @page{size:A4;margin:12mm}
  :root{--fundo:#fff;--texto:#000;--suave:#444;--linha:#ddd;--codigo:#f1f1f1}
  body{padding:0;font-size:9pt}
  .colunas{columns:2;column-gap:8mm}
  h2{-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#fff!important}
}
`.trim();

export function gerarHtml(dados: TecnologiaCheatsheet[], meta: MetaCheatsheet): string {
  const conhecidas = new Set(['git', 'docker']);
  const secoes = dados
    .map((tec) => {
      const cats = tec.categorias
        .map(
          (cat) =>
            `<section class="cat"><h3>${esc(cat.nome)}</h3><ul>${cat.itens
              .map(
                (i) =>
                  `<li><code>${esc(i.comando)}</code>${i.destrutivo ? ' <span class="perigo" title="Destrutivo">⚠</span>' : ''}<span class="resumo">${esc(i.resumo)} <small>(${ROTULO_NIVEL[i.nivel]})</small></span></li>`,
              )
              .join('')}</ul></section>`,
        )
        .join('');
      const classe = conhecidas.has(tec.id) ? tec.id : 'outra';
      return `<h2 class="${classe}">${esc(tec.nome)}</h2><div class="colunas">${cats}</div>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DevGuia — Cheat Sheet</title>
<meta name="description" content="${total(dados)} comandos de ${esc(dados.map((t) => t.nome).join(' e '))} em uma página, para consulta offline.">
<style>${CSS}</style>
</head>
<body>
<header>
<h1>DevGuia — Cheat Sheet</h1>
<p class="meta">${total(dados)} comandos · gerado em ${esc(meta.data)} · <a href="${esc(meta.url)}">${esc(meta.url)}</a> · <span class="perigo">⚠</span> = destrutivo, leia o aviso antes de usar</p>
</header>
<main>
${secoes}
</main>
<footer>Conteúdo sob CC BY 4.0 — pode reusar, dando crédito ao DevGuia (${esc(meta.url)}).</footer>
</body>
</html>
`;
}
