import { getChrome } from "@/lib/content/data";
import type { ContatoBlocoSection } from "@/lib/content/types";
import { whatsappUrl } from "@/lib/whatsapp";

export async function ContatoBloco({ section }: { section: ContatoBlocoSection }) {
  const { settings, contacts } = await getChrome();
  const isProd = process.env.NODE_ENV === "production";
  const wa = contacts.map((c) => ({ ...c, href: whatsappUrl(c) })).filter((c) => !isProd || c.href);
  return (
    <div className="pd2-light">
      <section className="pd2-contacts" aria-label="Contatos">
        {section.title ? <h2>{section.title}</h2> : null}
        <ul>
          {wa.map((c) => (
            <li key={c.key}>
              <b>WhatsApp — {c.label}</b>
              {c.href ? <a className="pd2-link" href={c.href} target="_blank" rel="noopener noreferrer">Conversar<span className="sr"> com {c.label} (nova aba)</span></a> : <span>número pendente</span>}
            </li>
          ))}
          {settings.email ? <li><b>E-mail</b><a className="pd2-link" href={`mailto:${settings.email}`}>{settings.email}</a></li> : null}
          {settings.instagramUrl ? <li><b>Instagram</b><a className="pd2-link" href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">Abrir<span className="sr"> (nova aba)</span></a></li> : null}
          {settings.address ? <li><b>Endereço</b><span>{settings.address}</span></li> : null}
        </ul>
      </section>
    </div>
  );
}
