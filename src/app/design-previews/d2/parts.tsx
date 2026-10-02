import type { CSSProperties } from "react";
import { brand, nav, fontPairs, stays, groups, waContacts, siteLinks, BOOKING_ENGINE, stayHref } from "../content";
import { SiteNav } from "./nav";
import { HeaderShell } from "./header-shell";
import { WhatsApp } from "./whatsapp";

const RIDGE = "M0 16 C10 15 18 13 28 14 C38 15 44 9 55 8 C64 7 69 3 80 2 C88 1 94 5 104 7 C111 8 116 12 120 12";

export function Mark() {
  return (
    <a href="#" className="pd2-mark" aria-label={brand.name}>
      <svg viewBox="0 0 120 18" aria-hidden="true"><path d={RIDGE} /></svg>
      <span>Sítio Recanto Azul</span>
    </a>
  );
}

export function Header({ solid = false }: { solid?: boolean }) {
  const grouped = groups.map((g) => ({
    name: g.name,
    stays: g.slugs.map((slug) => {
      const st = stays.find((x) => x.slug === slug)!;
      return { name: st.name, href: stayHref(slug), guests: st.guests };
    }),
  }));
  const links = [
    { label: "Extras", href: siteLinks.extras },
    { label: "Experiências", href: siteLinks.experiencias },
    { label: "Casamentos no sítio", href: siteLinks.casamentos },
    { label: "Políticas", href: siteLinks.politicas },
    { label: "Localização", href: siteLinks.localizacao },
  ];
  return (
    <HeaderShell solid={solid}>
      <a href={siteLinks.home} className="pd2-mark" aria-label={brand.name}>
        <svg viewBox="0 0 120 18" aria-hidden="true"><path d={RIDGE} /></svg>
        <span>Sítio Recanto Azul</span>
      </a>
      <SiteNav groups={grouped} contacts={[...waContacts]} links={links} booking={BOOKING_ENGINE} />
    </HeaderShell>
  );
}

/** Casca das páginas internas (Extras, Experiências, Casamentos, Políticas): fontes, cabeçalho sólido, rodapé, WhatsApp. */
export function Shell({ fonts, children, direct }: { fonts?: string; children: React.ReactNode; direct?: string }) {
  const f = d2Fonts(fonts);
  return (
    <div className={f.className} style={f.style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {f.hrefs.map((h) => <link key={h} rel="stylesheet" href={h} />)}
      <Header solid />
      {children}
      <Footer />
      <WhatsApp groups={waContacts} variant="float" direct={direct} />
    </div>
  );
}

export function Footer() {
  const links = nav.filter((n) => n !== "Contato");
  return (
    <footer className="pd2-foot">
      <div className="brand"><Mark /><p>{brand.place}</p></div>
      <div className="col">
        <h4>Navegue</h4>
        <ul>{links.map((n) => <li key={n}><a href="#">{n}</a></li>)}</ul>
      </div>
      <div className="col">
        <h4>Contato</h4>
        <ul>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">WhatsApp</a></li>
          <li><a href="#">Perguntas frequentes</a></li>
        </ul>
      </div>
      <p className="mail">{brand.email}</p>
      <p className="copy">© 2026 {brand.name}.</p>
    </footer>
  );
}

/** Fontes da D2: por padrão (auto) Par 1 no desktop e Par 2 no mobile; ?fonts=1|2 força um par. */
export function d2Fonts(fonts?: string) {
  const mode = fonts === "1" || fonts === "2" ? fonts : "auto";
  const a = fontPairs.c["1"];
  const b = fontPairs.c["2"];
  const style = { "--f1d": a.display, "--f1b": a.body, "--f2d": b.display, "--f2b": b.body } as CSSProperties;
  return { mode, style, hrefs: mode === "auto" ? [a.href, b.href] : [mode === "1" ? a.href : b.href], className: `pd2 f-${mode}` };
}
