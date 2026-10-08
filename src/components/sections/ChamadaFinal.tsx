import { getChrome } from "@/lib/content/data";
import type { ChamadaFinalSection } from "@/lib/content/types";
import { Photo } from "@/components/site/fx";
import { WhatsApp } from "@/components/site/whatsapp";
import { photo, waGroups } from "@/components/site/util";

export async function ChamadaFinal({ section }: { section: ChamadaFinalSection }) {
  const { contacts } = await getChrome();
  return (
    <section className="pd2-cta">
      <Photo {...photo(section.image)} />
      <div className="pd2-cta-in">
        <h2>{section.title}</h2>
        <div className="links">
          <a className="pd2-link" href="/acomodacoes">Ver acomodações</a>
          <WhatsApp groups={waGroups(contacts)} label="Falar pelo WhatsApp" />
        </div>
      </div>
    </section>
  );
}
