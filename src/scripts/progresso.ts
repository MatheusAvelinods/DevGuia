// Progresso do leitor (capítulos concluídos, recordes do treino), guardado só no
// navegador. Sem login, sem cookies, nada sai da máquina (RNF07).
const CHAVE = 'devguia:progresso:v1';
export const EVENTO_PROGRESSO = 'devguia:progresso';

export interface Progresso {
  /** id do capítulo (ex.: "git/tutorial/desfazendo-coisas") → data em que foi concluído */
  capitulos: Record<string, string>;
  /** melhor pontuação do Modo Treino por modo (ex.: "git:todos") */
  recordes: Record<string, number>;
}

const vazio = (): Progresso => ({ capitulos: {}, recordes: {} });

export function lerProgresso(): Progresso {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return vazio();
    const dados = JSON.parse(bruto);
    return { capitulos: dados.capitulos ?? {}, recordes: dados.recordes ?? {} };
  } catch {
    return vazio();
  }
}

function salvar(p: Progresso) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* modo privado ou armazenamento bloqueado: segue sem salvar */
  }
  document.dispatchEvent(new CustomEvent(EVENTO_PROGRESSO, { detail: p }));
}

export function capituloConcluido(id: string) {
  return Boolean(lerProgresso().capitulos[id]);
}

export function marcarCapitulo(id: string, concluido: boolean) {
  const p = lerProgresso();
  if (concluido) p.capitulos[id] = new Date().toISOString();
  else delete p.capitulos[id];
  salvar(p);
}

export function registrarRecorde(modo: string, pontos: number): boolean {
  const p = lerProgresso();
  if (pontos <= (p.recordes[modo] ?? 0)) return false;
  p.recordes[modo] = pontos;
  salvar(p);
  return true;
}
