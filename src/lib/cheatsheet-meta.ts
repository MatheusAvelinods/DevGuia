// Metadados dos downloads: URL pública do site e data do build.
export function metaCheatsheet() {
  const url = new URL(import.meta.env.BASE_URL, import.meta.env.SITE).href;
  const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(
    new Date(),
  );
  return { url, data };
}
