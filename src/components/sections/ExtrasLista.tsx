import { getChrome, getExtras } from "@/lib/content/data";
import type { ExtrasListaSection } from "@/lib/content/types";
import { WhatsApp } from "@/components/site/whatsapp";
import { waGroups } from "@/components/site/util";

export async function ExtrasLista({ section }: { section: ExtrasListaSection }) {
  const [extras, { contacts }] = await Promise.all([getExtras(), getChrome()]);
  const key = section.whatsappKey ?? "romanticas";
  return (
    <div className="pd2-light">
      <section className="pd2-extras-page" aria-label="Lista de extras">
        {extras.map((x) => (
          <article key={x.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.image.src} srcSet={x.image.srcSet} sizes="(min-width: 900px) 40vw, 100vw" alt={x.image.alt} loading="lazy" decoding="async" style={{ objectPosition: x.image.focus }} />
            <div className="txt">
              <h2>{x.name}</h2>
              {x.description ? <p>{x.description}</p> : null}
              <WhatsApp groups={waGroups(contacts, { extra: `Gostaria de saber mais sobre: ${x.name}.` })} label={`Consultar ${x.name.toLowerCase()}`} direct={key} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
