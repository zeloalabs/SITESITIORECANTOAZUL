import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site/chrome";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getChrome, getPage } from "@/lib/content/data";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [{ settings }, page] = await Promise.all([getChrome(), getPage("home")]);
  const hero = page?.sections?.find((s) => s._type === "hero");
  return buildMetadata({ path: "/", title: page?.seoTitle, description: page?.seoDescription, settings, image: hero?._type === "hero" ? hero.image : null });
}

export default async function Home() {
  const page = await getPage("home");
  if (!page?.sections?.length) notFound();
  return (
    <PageFrame>
      <main id="conteudo">
        <SectionRenderer sections={page.sections} />
      </main>
    </PageFrame>
  );
}
