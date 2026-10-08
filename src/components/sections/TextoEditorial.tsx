import { PortableText, type PortableTextBlock } from "next-sanity";
import type { TextoEditorialSection } from "@/lib/content/types";

export function TextoEditorial({ section }: { section: TextoEditorialSection }) {
  return (
    <div className="pd2-light">
      <section className="pd2-prose">
        {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
        {section.title ? <h2>{section.title}</h2> : null}
        {section.body ? <PortableText value={section.body as PortableTextBlock[]} /> : null}
      </section>
    </div>
  );
}
