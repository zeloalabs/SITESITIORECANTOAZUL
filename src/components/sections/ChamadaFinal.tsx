import { getChrome } from "@/lib/content/data";
import { reserveUrl } from "@/lib/booking";
import type { ChamadaFinalSection } from "@/lib/content/types";
import { Photo } from "@/components/site/fx";
import { WhatsApp } from "@/components/site/whatsapp";
import { photo, waGroups } from "@/components/site/util";

export async function ChamadaFinal({ section }: { section: ChamadaFinalSection }) {
  const { settings, contacts } = await getChrome();
  const reserve = reserveUrl(settings);
  return (
    <section className="pd2-cta">
      <Photo {...photo(section.image)} />
      <div className="pd2-cta-in">
        <h2>{section.title}</h2>
        <div className="links">
          {reserve ? <a className="pd2-link" href={reserve} target="_blank" rel="noopener noreferrer">Reservar<span className="sr"> (abre o motor de reservas em nova aba)</span></a> : null}
          <WhatsApp groups={waGroups(contacts)} label="Falar pelo WhatsApp" />
        </div>
      </div>
    </section>
  );
}
