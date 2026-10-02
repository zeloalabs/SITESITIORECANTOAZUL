"use client";

// Faixas verticais de foto (D2): a ativa se expande no desktop. Troca com intenção (atraso curto),
// para não tremer quando o mouse atravessa as faixas. No mobile vira carrossel com snap.
import { useEffect, useRef, useState } from "react";

export type PanelItem = {
  slug: string;
  name: string;
  line: string;
  guests: string;
  src: string;
  alt: string;
  focus?: string;
  href: string;
};

export function Panels({ items, openFirst = null, tall = true }: { items: PanelItem[]; openFirst?: number | null; tall?: boolean }) {
  const [open, setOpen] = useState<number | null>(openFirst);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const intend = (i: number | null) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(i), 140);
  };

  return (
    <div
      className={`pd2-panels ${tall ? "" : "short"}`}
      onMouseLeave={() => intend(null)}
    >
      {items.map((it, i) => (
        <article
          key={it.slug}
          tabIndex={0}
          data-panel
          className={`pd2-panel ${i === open ? "is-open" : ""}`}
          aria-label={it.name}
          aria-expanded={i === open}
          onMouseEnter={() => intend(i)}
          onMouseLeave={() => window.clearTimeout(timer.current)}
          onFocus={() => setOpen(i)}
          onClick={() => setOpen(i)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.src} alt={it.alt} loading="lazy" decoding="async" style={{ objectPosition: it.focus }} />
          <span className="vname" aria-hidden="true"><span>{it.name}</span></span>
          <div className="info">
            <p className="g">{it.guests}</p>
            <h3>{it.name}</h3>
            <p className="line">{it.line}</p>
            <a className="pd2-link" href={it.href}>Consultar disponibilidade</a>
          </div>
        </article>
      ))}
    </div>
  );
}
