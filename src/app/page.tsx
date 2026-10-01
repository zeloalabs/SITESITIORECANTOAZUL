import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/lib/content/live";

const HOME_QUERY = defineQuery(`*[_type == "page" && slug.current == "home"][0]{ _id, title }`);

export default async function Home() {
  const { data } = await sanityFetch({ query: HOME_QUERY });
  const page = data as { _id: string; title?: string } | null;
  return (
    <main>
      <h1>{page?.title ?? "Sítio Recanto Azul"}</h1>
    </main>
  );
}
