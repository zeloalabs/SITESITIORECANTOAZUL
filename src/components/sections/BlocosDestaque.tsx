import type { BlocosDestaqueSection } from "@/lib/content/types";

export function BlocosDestaque({ section }: { section: BlocosDestaqueSection }) {
  return (
    <div className="pd2-light">
      <section className="pd2-occ" aria-labelledby={`occ-${section._key}`}>
        <h2 id={`occ-${section._key}`}>{section.title}</h2>
        <div className="tiles">
          {section.tiles.map((t) => (
            <a key={t.href} href={t.href} className="tile" {...(t.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.image.src} srcSet={t.image.srcSet} sizes="(min-width: 900px) 45vw, 100vw" alt={t.image.alt} loading="lazy" decoding="async" style={{ objectPosition: t.image.focus }} />
              <h3>{t.title}</h3>
              {t.text ? <p>{t.text}</p> : null}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
