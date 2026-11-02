export interface LinkQuebrado {
  pagina: string;
  url: string;
  motivo: string;
}
export function checarLinks(distDir: string, base: string): Promise<LinkQuebrado[]>;
