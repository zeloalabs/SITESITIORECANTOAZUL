import type { TextoComFotoSection } from "@/lib/content/types";
import { Photo } from "@/components/site/fx";
import { photo } from "@/components/site/util";

export function TextoComFoto({ section }: { section: TextoComFotoSection }) {
  return (
    <div className="pd2-light">
      <section className="pd2-todo wide" aria-label={section.title}>
        <Photo className="ph" {...photo(section.image)} sizes="(min-width: 900px) 55vw, 100vw" />
        <div>
          <h2>{section.title}</h2>
          {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>
    </div>
  );
}
