import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site/chrome";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getChrome, getPage } from "@/lib/content/data";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [{ settings }, page] = await Promise.all([getChrome(), getPage("acomodacoes")]);
  return buildMetadata({ path: "/acomodacoes", title: page?.seoTitle || "Acomodações", description: page?.seoDescription, settings });
}

export default async function Acomodacoes() {
  const page = await getPage("acomodacoes");
  if (!page?.sections?.length) notFound();
  return (
    <PageFrame solid>
      <main id="conteudo">
        <SectionRenderer sections={page.sections} />
      </main>
    </PageFrame>
  );
}
