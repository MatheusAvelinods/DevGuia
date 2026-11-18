export function servirDist(
  dist?: string,
  base?: string,
): Promise<{ url: string; fechar: () => Promise<void> }>;
