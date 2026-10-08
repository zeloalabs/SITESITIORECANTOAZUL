"use client";

// WhatsApp: um número para as românticas e outro para as de grupos (no CMS, cada grupo aponta para um contato).
// Sem grupo (Home, páginas gerais): seletor pequeno. Com grupo (página de acomodação): link direto ao número do grupo.
import { useEffect, useRef, useState } from "react";

// `href`: link real (wa.me) do contato. Sem `href` (número ainda não cadastrado) o contato só aparece fora de produção,
// desabilitado; nos previews (sem `href` em nenhum contato) o link é um âncora inerte.
export type WaGroup = { id: string; name: string; href?: string | null };
type Props = { groups: readonly WaGroup[]; label?: string; variant?: "link" | "float"; direct?: string };

const isProd = process.env.NODE_ENV === "production";

export function WhatsApp({ groups: all, label = "WhatsApp", variant = "link", direct }: Props) {
  const groups = isProd ? all.filter((g) => g.href !== null) : all;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(variant !== "float"); // o botão flutuante só aparece depois do hero, para não cobrir a busca e os CTAs
  const root = useRef<HTMLDivElement>(null);
  const id = `wa-menu-${variant}-${label.length}`;
  const hrefOf = (g: WaGroup) => (g.href === undefined ? `#whatsapp-${g.id}` : g.href);
  const open_ = (g: WaGroup) => (g.href ? { target: "_blank", rel: "noopener noreferrer" } : {});

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

  const g = direct ? groups.find((x) => x.id === direct) : undefined;
  if (g) {
    const href = hrefOf(g);
    return href ? (
      <a className={`wa wa-${variant} wa-direct ${shown ? "" : "is-off"}`} href={href} {...open_(g)} onClick={g.href === undefined ? (e) => e.preventDefault() : undefined}>
        {label}
        <span className="sr"> — {g.name}{g.href ? " (nova aba)" : ""}</span>
      </a>
    ) : (
      <span className={`wa wa-${variant} wa-direct ${shown ? "" : "is-off"}`} aria-disabled="true">{label} (número pendente)</span>
    );
  }
  if (!groups.length) return null;

  return (
    <div ref={root} className={`wa wa-${variant} ${shown ? "" : "is-off"}`}>
      <button type="button" className="wa-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open ? (
        <ul id={id} className="wa-menu">
          {groups.map((g) => (
            <li key={g.id}>
              {hrefOf(g) ? (
                <a href={hrefOf(g) ?? undefined} {...open_(g)} onClick={(e) => { if (g.href === undefined) e.preventDefault(); setOpen(false); }}>{g.name}{g.href ? <span className="sr"> (nova aba)</span> : null}</a>
              ) : (
                <span aria-disabled="true">{g.name} (número pendente)</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
