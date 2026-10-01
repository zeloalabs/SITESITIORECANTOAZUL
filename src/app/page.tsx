import { sanityFetch } from "@/lib/content/client";
import { PAGE_BY_SLUG_QUERY } from "@/lib/content/queries";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { PageDoc } from "@/lib/content/types";

export default async function Home() {
  const { data } = await sanityFetch({ query: PAGE_BY_SLUG_QUERY, params: { slug: "home" } });
  const page = data as PageDoc | null;
  return <main>{page ? <SectionRenderer sections={page.sections} /> : null}</main>;
}
