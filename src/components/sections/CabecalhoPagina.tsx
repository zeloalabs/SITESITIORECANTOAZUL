import { getChrome } from "@/lib/content/data";
import type { CabecalhoPaginaSection } from "@/lib/content/types";
import { WhatsApp } from "@/components/site/whatsapp";
import { waGroups } from "@/components/site/util";

export async function CabecalhoPagina({ section }: { section: CabecalhoPaginaSection }) {
  const { contacts } = await getChrome();
  const groups = waGroups(contacts);
  const wa = section.whatsappKey && groups.some((g) => g.id === section.whatsappKey);
  return (
    <header className="pd2-pagehead">
      <h1>{section.title}</h1>
      {section.lead ? <p>{section.lead}</p> : null}
      {wa ? <div className="cta"><WhatsApp groups={groups} label={section.whatsappLabel ?? "Falar pelo WhatsApp"} direct={section.whatsappKey} /></div> : null}
    </header>
  );
}
