// Conta comandos por tecnologia e, opcionalmente, exige um mínimo.
// Uso: node scripts/contar-comandos.mjs [--min git=60 --min docker=60]
import { fileURLToPath } from 'node:url';
import { carregarCategorias } from './ler-comandos.mjs';

export async function contarComandos(pasta) {
  const contagem = {};
  for (const cat of await carregarCategorias(pasta)) {
    const t = (contagem[cat.tecnologia] ??= { total: 0, destrutivos: 0, cheatsheet: 0 });
    for (const c of cat.comandos) {
      t.total++;
      if (c.destrutivo) t.destrutivos++;
      if (c.cheatsheet !== false) t.cheatsheet++;
    }
  }
  return contagem;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const minimos = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--min') {
      const [tec, n] = args[++i].split('=');
      minimos[tec] = Number(n);
    }
  }
  const contagem = await contarComandos();
  console.table(contagem);
  const falhas = Object.entries(minimos).filter(([tec, min]) => (contagem[tec]?.total ?? 0) < min);
  for (const [tec, min] of falhas) {
    console.error(`✗ ${tec}: ${contagem[tec]?.total ?? 0} comandos, mínimo exigido ${min}`);
  }
  if (falhas.length) process.exit(1);
}
