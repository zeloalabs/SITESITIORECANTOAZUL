"use client";

// Menu principal da D2. Desktop: itens + dois menus (Acomodações, WhatsApp). Mobile: botão "Menu" abre tela cheia.
// Hrefs/itens vêm do servidor; no CMS: acomodações/grupos/contatos editáveis, links de páginas fixos por rota.
import { useEffect, useRef, useState } from "react";

type Stay = { name: string; href: string; guests: string };
type Props = {
  groups: { name: string; stays: Stay[] }[];
  contacts: { id: string; name: string }[];
  links: { label: string; href: string }[];
  booking: string;
};

export function SiteNav({ groups, contacts, links, booking }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLElement>(null);
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
        {drop(
          "wa",
          "WhatsApp",
          <ul className="one">
            {contacts.map((c) => (
              <li key={c.id}><a href={`#whatsapp-${c.id}`} onClick={(e) => e.preventDefault()}>{c.name}</a></li>
            ))}
          </ul>,
        )}
        <a className="pd2-link" href={booking} target="_blank" rel="noopener noreferrer">Reservar<span className="sr"> (abre o motor de reservas em nova aba)</span></a>
      </nav>

      <button type="button" className="pd2-menu-btn" onClick={() => setMenu(true)} aria-haspopup="dialog">Menu</button>
      {menu ? (
        <div className="pd2-overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="top">
            <span>Sítio Recanto Azul</span>
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
            <details>
              <summary>WhatsApp</summary>
              <div className="sub">
                <ul>{contacts.map((c) => <li key={c.id}><a href={`#whatsapp-${c.id}`} onClick={(e) => e.preventDefault()}>{c.name}</a></li>)}</ul>
              </div>
            </details>
          </div>
          <a className="book" href={booking} target="_blank" rel="noopener noreferrer">Reservar →</a>
        </div>
      ) : null}
    </>
  );
}
