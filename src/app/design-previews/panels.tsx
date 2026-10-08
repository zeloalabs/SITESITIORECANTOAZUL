"use client";

// Faixas verticais de foto: a ativa se expande (desktop, hover/foco/clique); no mobile vira carrossel com snap.
import { useState } from "react";

export type PanelItem = {
  slug: string;
  name: string;
  line: string;
  guests: string;
  src: string;
  alt: string;
  focus?: string;
};

export function Panels({ items, openFirst = 0, className = "" }: { items: PanelItem[]; openFirst?: number; className?: string }) {
  const [open, setOpen] = useState(openFirst);
  return (
    <div className={`pd-panels ${className}`}>
      {items.map((it, i) => (
        <article
          key={it.slug}
          tabIndex={0}
          data-panel
          className={`pd-panel ${i === open ? "is-open" : ""}`}
          onMouseEnter={() => setOpen(i)}
          onFocus={() => setOpen(i)}
          onClick={() => setOpen(i)}
          aria-label={it.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.src} alt={it.alt} loading="lazy" decoding="async" style={{ objectPosition: it.focus }} />
          <span className="vname" aria-hidden="true"><span>{it.name}</span></span>
          <div className="info">
            <span className="g">{it.guests}</span>
            <h3>{it.name}</h3>
            <p className="line">{it.line}</p>
            <a className="pd-link" href="#">Consultar disponibilidade</a>
          </div>
        </article>
      ))}
    </div>
  );
}
