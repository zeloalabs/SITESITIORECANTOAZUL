import type { HeroSection } from "@/lib/content/types";

export function Hero({ section }: { section: HeroSection }) {
  return (
    <section>
      {section.eyebrow ? <p>{section.eyebrow}</p> : null}
      <h1>{section.title}</h1>
      {section.text ? <p>{section.text}</p> : null}
    </section>
  );
}
