import { getChrome } from "@/lib/content/data";
import type { AcomodacoesSection } from "@/lib/content/types";
import { Panels, type PanelItem } from "@/components/site/panels";
import { stayHref } from "@/components/site/util";

export async function Acomodacoes({ section }: { section: AcomodacoesSection }) {
  const { groups } = await getChrome();
  const shown = groups.filter((g) => g.showOnHome && g.stays.length);
  const toItem = (s: (typeof shown)[number]["stays"][number]): PanelItem => ({
    slug: s.slug,
    name: s.name,
    line: s.tagline,
    guests: s.capacityLabel,
    src: s.cover.src,
    srcSet: s.cover.srcSet,
    alt: s.cover.alt,
    focus: s.cover.focus,
    href: stayHref(s.slug),
  });
  return (
    <section id="acomodacoes" className="pd2-stays" aria-labelledby="pd-stays-t">
      <div className="pd2-stays-head"><h2 id="pd-stays-t">{section.title}</h2></div>
      {/* Desktop: painéis que se abrem, um grupo por vez */}
      <div className="pd2-panels-wrap">
        {shown.map((g) => (
          <div key={g.id} className="pd2-group">
            <div className="pd2-group-head"><h3>{g.name}</h3></div>
            <Panels items={g.stays.map(toItem)} tall={g.stays.length > 3} />
          </div>
        ))}
      </div>
      {/* Mobile: lista editorial compacta, a linha inteira é o link */}
      <div className="pd2-list">
        {shown.map((g) => (
          <div key={g.id} className="pd2-list-group">
            <p className="pd2-divider"><span>{g.name}</span></p>
            <ul>
              {g.stays.map((s) => (
                <li key={s.slug} className="pd2-row">
                  <a href={stayHref(s.slug)}>
                    <div className="ph">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.cover.src} srcSet={s.cover.srcSet} sizes="100vw" alt="" loading="lazy" decoding="async" style={{ objectPosition: s.cover.focus }} />
                    </div>
                    <div className="cap">
                      <h3>{s.name}</h3>
                      <p className="line">{s.tagline}</p>
                      <span className="g">{s.capacityLabel}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
