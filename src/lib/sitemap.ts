/** Caminhos públicos do sitemap: Home, páginas do CMS (sem a Home) e uma página por acomodação, sem repetição. */
export function sitemapPaths(opts: { pageSlugs: string[]; stayPaths: string[] }): string[] {
  const paths = ["/", "/acomodacoes", ...opts.pageSlugs.filter((s) => s && s !== "home").map((s) => `/${s}`), ...opts.stayPaths];
  return [...new Set(paths)];
}
