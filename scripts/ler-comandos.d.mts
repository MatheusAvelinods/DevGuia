export interface CategoriaBruta {
  tecnologia: string;
  slug: string;
  arquivo: string;
  dados: unknown;
  comandos: Array<{ id: string; comando: string } & Record<string, unknown>>;
}
export function carregarCategorias(pasta?: string): Promise<CategoriaBruta[]>;
