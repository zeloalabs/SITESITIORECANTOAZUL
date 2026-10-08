import { getChrome } from "@/lib/content/data";
import type { LocalizacaoSection } from "@/lib/content/types";
import { MapFacade } from "@/components/site/map";

export async function Localizacao({ section }: { section: LocalizacaoSection }) {
  const { settings } = await getChrome();
  const id = `loc-${section._key}`;
  return (
    <section id="localizacao" className="pd2-loc" aria-labelledby={id}>
      <div className="txt">
        <h2 id={id}>{section.title}</h2>
        <p>{section.text ?? settings.place}</p>
        {settings.address ? <p>{settings.address}</p> : null}
        {section.note ? <p className="mut">{section.note}</p> : null}
        <a className="pd2-link" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">Abrir no Google Maps<span className="sr"> (nova aba)</span></a>
      </div>
      {settings.mapsEmbedUrl ? <MapFacade embed={settings.mapsEmbedUrl} mapsUrl={settings.mapsUrl} /> : null}
    </section>
  );
}
