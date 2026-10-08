import type { MetadataRoute } from "next";
import { getChrome, getPageSlugs } from "@/lib/content/data";
import { sitemapPaths } from "@/lib/sitemap";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ groups }, pageSlugs] = await Promise.all([getChrome(), getPageSlugs()]);
  const stayPaths = groups.flatMap((g) => g.stays.map((s) => `/acomodacoes/${s.slug}`));
  return sitemapPaths({ pageSlugs, stayPaths }).map((p) => ({ url: `${siteUrl}${p === "/" ? "" : p}` }));
}
