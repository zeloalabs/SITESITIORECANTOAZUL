import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site/chrome";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getChrome, getPage } from "@/lib/content/data";
import { directContactOf } from "@/lib/content/page-helpers";
import { buildMetadata } from "@/lib/seo";

type P = { params: Promise<{ slug: string }> };

// Todas as páginas do CMS (/extras, /experiencias, /casamentos, /politicas, /faq, /contato, /localizacao e as criadas no Studio).
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const [{ settings }, page] = await Promise.all([getChrome(), getPage(slug)]);
  if (!page) return {};
  return buildMetadata({ path: `/${slug}`, title: page.seoTitle || page.title, description: page.seoDescription, settings });
}

export default async function CmsPage({ params }: P) {
  const { slug } = await params;
  if (slug === "home") notFound(); // a Home é só "/"
  const page = await getPage(slug);
  if (!page?.sections?.length) notFound();
  const solid = page.sections[0]?._type !== "hero";
  return (
    <PageFrame solid={solid} direct={directContactOf(page.sections)}>
      <main id="conteudo">
        <SectionRenderer sections={page.sections} />
      </main>
    </PageFrame>
  );
}
