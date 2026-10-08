"use client";

// Menu principal da D2. Desktop: itens + dois menus (Acomodações, WhatsApp). Mobile: botão "Menu" abre tela cheia.
// Hrefs/itens vêm do servidor; no CMS: acomodações/grupos/contatos editáveis, links de páginas fixos por rota.
import { useEffect, useRef, useState } from "react";

type Stay = { name: string; href: string; guests: string };
type Props = {
  groups: { name: string; stays: Stay[] }[];
  contacts: { id: string; name: string; href?: string | null }[];
  links: { label: string; href: string }[];
  /** Links que aparecem só no menu mobile (o desktop mantém o cabeçalho enxuto). */
  moreLinks?: { label: string; href: string }[];
  booking: string;
  homeHref?: string;
  brandName?: string;
};

export function SiteNav({ groups, contacts, links, moreLinks = [], booking, brandName = "Sítio Recanto Azul" }: Props) {
  // Link para o motor (externo) abre em nova aba; link interno (escolha da acomodação) abre na mesma.
  const external = /^https?:\/\//.test(booking);
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLElement>(null);
  const usable = process.env.NODE_ENV === "production" ? contacts.filter((c) => c.href !== null) : contacts;
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(null);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
    };
  }, [menu]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hover = (id: string | null, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(id), delay);
  };

  const drop = (id: string, label: string, panel: React.ReactNode) => (
    <div className="pd2-drop" onMouseEnter={() => hover(id, 120)} onMouseLeave={() => hover(null, 260)}>
      <button type="button" aria-expanded={open === id} aria-haspopup="true" aria-controls={`drop-${id}`} onClick={() => setOpen(open === id ? null : id)}>
        {label}<span aria-hidden="true" className="chev" />
      </button>
      {open === id ? <div id={`drop-${id}`} className="pd2-panel-menu" onClick={() => setOpen(null)}>{panel}</div> : null}
    </div>
  );

  return (
    <>
      <nav ref={root} className="pd2-nav" aria-label="Principal">
        {drop(
          "acom",
          "Acomodações",
          <div className="cols">
            {groups.map((g) => (
              <div key={g.name}>
                <p>{g.name}</p>
                <ul>
                  {g.stays.map((s) => (
                    <li key={s.href}><a href={s.href}>{s.name}<span>{s.guests}</span></a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>,
        )}
        {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        <a className="pd2-link" href={booking} {...ext}>Reservar{external ? <span className="sr"> (abre o motor de reservas em nova aba)</span> : null}</a>
      </nav>

      <button type="button" className="pd2-menu-btn" onClick={() => setMenu(true)} aria-haspopup="dialog">Menu</button>
      {menu ? (
        <div className="pd2-overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="top">
            <span>{brandName}</span>
            <button type="button" onClick={() => setMenu(false)} autoFocus>Fechar</button>
          </div>
          <div className="list">
            <details>
              <summary>Acomodações</summary>
              {groups.map((g) => (
                <div key={g.name} className="sub">
                  <p>{g.name}</p>
                  <ul>{g.stays.map((s) => <li key={s.href}><a href={s.href}>{s.name}</a></li>)}</ul>
                </div>
              ))}
            </details>
            {links.map((l) => <a key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.label}</a>)}
            {moreLinks.map((l) => <a key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.label}</a>)}
            {usable.length ? (
              <details>
                <summary>WhatsApp</summary>
                <div className="sub">
                  <ul>
                    {usable.map((c) => (
                      <li key={c.id}>
                        {c.href === undefined ? (
                          <a href={`#whatsapp-${c.id}`} onClick={(e) => e.preventDefault()}>{c.name}</a>
                        ) : c.href ? (
                          <a href={c.href} target="_blank" rel="noopener noreferrer">{c.name}<span className="sr"> (nova aba)</span></a>
                        ) : (
                          <span aria-disabled="true">{c.name} (número pendente)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ) : null}
          </div>
          <a className="book" href={booking} {...ext}>Reservar →</a>
        </div>
      ) : null}
    </>
  );
}
