import { PortableText, type PortableTextBlock } from "next-sanity";
import type { TextoEditorialSection } from "@/lib/content/types";

export function TextoEditorial({ section }: { section: TextoEditorialSection }) {
  return (
    <section>
      {section.eyebrow ? <p>{section.eyebrow}</p> : null}
      {section.title ? <h2>{section.title}</h2> : null}
      {section.body ? <PortableText value={section.body as PortableTextBlock[]} /> : null}
    </section>
  );
}
