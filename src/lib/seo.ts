import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/content/types";
import type { Img } from "@/lib/images";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://sitiorecantoazul.com.br").replace(/\/$/, "");

/** Metadados de uma página: título/descrição do CMS com padrão do site, canonical e Open Graph. Placeholders nunca viram imagem social. */
export function buildMetadata(opts: { title?: string | null; description?: string | null; path: string; settings: SiteSettings; image?: Img | null }): Metadata {
  const { settings, path } = opts;
  const home = path === "/";
  const title = opts.title?.trim() || (home ? settings.seoTitle : null) || settings.siteName;
  const description = opts.description?.trim() || settings.seoDescription || undefined;
  const image = opts.image && !opts.image.placeholder ? opts.image.full ?? opts.image.src : undefined;
  return {
    title: home ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: settings.siteName,
      title,
      description,
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
