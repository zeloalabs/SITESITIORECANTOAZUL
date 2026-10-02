"use client";

// WhatsApp: um número para as românticas e outro para as de grupos (no CMS, cada grupo aponta para um contato).
// Sem grupo (Home, páginas gerais): seletor pequeno. Com grupo (página de acomodação): link direto ao número do grupo.
import { useEffect, useRef, useState } from "react";

type Group = { id: string; name: string };
type Props = { groups: readonly Group[]; label?: string; variant?: "link" | "float"; direct?: string };

export function WhatsApp({ groups, label = "WhatsApp", variant = "link", direct }: Props) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(variant !== "float"); // o botão flutuante só aparece depois do hero, para não cobrir a busca e os CTAs
  const root = useRef<HTMLDivElement>(null);
  const id = `wa-menu-${variant}-${label.length}`;

  useEffect(() => {
    if (variant !== "float") return;
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  if (direct) {
    const g = groups.find((x) => x.id === direct);
    return (
      <a className={`wa wa-${variant} wa-direct ${shown ? "" : "is-off"}`} href={`#whatsapp-${direct}`} onClick={(e) => e.preventDefault()}>
        {label}
        <span className="sr"> — {g?.name}</span>
      </a>
    );
  }

  return (
    <div ref={root} className={`wa wa-${variant} ${shown ? "" : "is-off"}`}>
      <button type="button" className="wa-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open ? (
        <ul id={id} className="wa-menu">
          {groups.map((g) => (
            <li key={g.id}>
              <a href={`#whatsapp-${g.id}`} onClick={(e) => { e.preventDefault(); setOpen(false); }}>{g.name}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
