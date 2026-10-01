import type { Section } from "@/lib/content/types";
import { Hero } from "./Hero";
import { TextoEditorial } from "./TextoEditorial";

export function SectionRenderer({ sections }: { sections: Section[] | null }) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case "hero":
            return <Hero key={section._key} section={section} />;
          case "textoEditorial":
            return <TextoEditorial key={section._key} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
