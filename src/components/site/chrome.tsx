import { getChrome } from "@/lib/content/data";
import { reserveUrl } from "@/lib/booking";
import { HeaderShell } from "./header-shell";
import { SiteNav } from "./nav";
import { WhatsApp } from "./whatsapp";
import { stayHref, waGroups } from "./util";

const RIDGE = "M0 16 C10 15 18 13 28 14 C38 15 44 9 55 8 C64 7 69 3 80 2 C88 1 94 5 104 7 C111 8 116 12 120 12";

export function Mark({ name }: { name: string }) {
  return (
    <a href="/" className="pd2-mark" aria-label={`${name} — página inicial`}>
      <svg viewBox="0 0 120 18" aria-hidden="true"><path d={RIDGE} /></svg>
      <span>{name}</span>
    </a>
  );
}

/** Cabeçalho do site (menu desktop + menu mobile). Transparente sobre o hero; `solid` nas páginas internas. */
export async function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { settings, groups, contacts } = await getChrome();
  const grouped = groups
    .filter((g) => g.stays.length)
    .map((g) => ({ name: g.name, stays: g.stays.map((s) => ({ name: s.name, href: stayHref(s.slug), guests: s.capacityLabel })) }));
  return (
    <HeaderShell solid={solid}>
      <Mark name={settings.siteName} />
      <SiteNav
        brandName={settings.siteName}
        groups={grouped}
        contacts={waGroups(contacts)}
        links={[
          { label: "Experiências", href: "/experiencias" },
          { label: "Extras", href: "/extras" },
          { label: "Localização", href: "/#localizacao" },
        ]}
        moreLinks={[
          { label: "Casamentos", href: "/casamentos" },
          { label: "Políticas", href: "/politicas" },
          { label: "Perguntas frequentes", href: "/faq" },
          { label: "Contato", href: "/contato" },
        ]}
        booking={reserveUrl(settings) ?? "/contato"}
      />
    </HeaderShell>
  );
}

export async function SiteFooter() {
  const { settings, contacts } = await getChrome();
  const navLinks = [
    { label: "Acomodações", href: "/acomodacoes" },
    { label: "Experiências", href: "/experiencias" },
    { label: "Extras", href: "/extras" },
    { label: "Localização", href: "/#localizacao" },
    { label: "Políticas", href: "/politicas" },
  ];
  return (
    <footer className="pd2-foot">
      <div className="brand"><Mark name={settings.siteName} /><p>{settings.place}</p></div>
      <div className="col">
        <h3>Navegue</h3>
        <ul>{navLinks.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
      </div>
      <div className="col">
        <h3>Contato</h3>
        <ul>
          {settings.instagramUrl ? <li><a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram<span className="sr"> (nova aba)</span></a></li> : null}
          <li><WhatsApp groups={waGroups(contacts)} label="WhatsApp" /></li>
          <li><a href="/faq">Perguntas frequentes</a></li>
          <li><a href="/contato">Contato</a></li>
        </ul>
      </div>
      {settings.email ? <p className="mail"><a href={`mailto:${settings.email}`}>{settings.email}</a></p> : null}
      <p className="copy">© {new Date().getFullYear()} {settings.siteName}.</p>
    </footer>
  );
}

/** Botão flutuante de WhatsApp. `direct`: contato do grupo da página (acomodações); sem ele, seletor. */
export async function FloatingWhatsApp({ direct, acomodacao }: { direct?: string | null; acomodacao?: string }) {
  const { contacts } = await getChrome();
  return <WhatsApp groups={waGroups(contacts, { acomodacao })} variant="float" direct={direct ?? undefined} />;
}

/** Moldura das páginas: cabeçalho, conteúdo, rodapé e WhatsApp flutuante. */
export async function PageFrame({ children, solid = false, direct, acomodacao, stickyBar = false }: { children: React.ReactNode; solid?: boolean; direct?: string | null; acomodacao?: string; stickyBar?: boolean }) {
  return (
    <>
      <SiteHeader solid={solid} />
      {children}
      <SiteFooter />
      {stickyBar ? (
        <>
          {/* No mobile a barra fixa já traz o WhatsApp: o botão flutuante só aparece a partir do desktop. */}
          <div className="wa-float-desktop"><FloatingWhatsApp direct={direct} acomodacao={acomodacao} /></div>
          <div className="stay-bar-spacer" aria-hidden="true" />
        </>
      ) : (
        <FloatingWhatsApp direct={direct} acomodacao={acomodacao} />
      )}
    </>
  );
}
