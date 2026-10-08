import type { IntroSection } from "@/lib/content/types";
import { Photo, Reveal, Ridge } from "@/components/site/fx";
import { photo } from "@/components/site/util";

export function Intro({ section }: { section: IntroSection }) {
  return (
    <div className="pd2-light">
      <section className="pd2-intro">
        <div className="pd2-intro-copy">
          <Reveal as="h2">{section.title}</Reveal>
          {section.text ? <Reveal as="p" className="body" delay={150}>{section.text}</Reveal> : null}
          {section.facts.length ? <ul className="facts">{section.facts.map((f) => <li key={f}>{f}</li>)}</ul> : null}
        </div>
        {section.photos.length ? (
          <div className="pd2-intro-ph">
            {section.photos.map((p, i) => (
              <figure key={i}>
                <Photo {...photo(p.image)} sizes="(min-width: 900px) 30vw, 90vw" />
                {p.caption ? <figcaption>{p.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}
      </section>
      <div className="pd2-rule"><Ridge /></div>
    </div>
  );
}
