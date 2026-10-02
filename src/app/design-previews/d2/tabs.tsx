"use client";

// Abas da página de acomodação (rótulos e conteúdo editáveis no CMS): Sobre | Comodidades.
import { useRef, useState } from "react";

import type { Extra } from "../content";

type Props = { about: string; capacity: string; amenities: string[]; extras?: Extra[]; whatsappHref?: string };

export function StayTabs({ about, capacity, amenities, extras = [], whatsappHref = "#whatsapp" }: Props) {
  const tabs = [
    { id: "sobre", label: "Sobre" },
    { id: "comodidades", label: "Comodidades" },
    ...(extras.length ? [{ id: "extras", label: "Extras" }] : []),
  ];
  const [cur, setCur] = useState(0);
  const base = "stay-tabs"; // um conjunto por página (useId causava divergência de hidratação)
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setCur(n);
    refs.current[n]?.focus();
  };

  return (
    <div className="pd2-tabs">
      <div role="tablist" aria-label="Informações da acomodação">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-t-${t.id}`}
            aria-selected={cur === i}
            aria-controls={`${base}-p-${t.id}`}
            tabIndex={cur === i ? 0 : -1}
            onClick={() => setCur(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(i + 1);
              else if (e.key === "ArrowLeft") move(i - 1);
              else if (e.key === "Home") move(0);
              else if (e.key === "End") move(tabs.length - 1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-p-${t.id}`} aria-labelledby={`${base}-t-${t.id}`} hidden={cur !== i} className="panel" tabIndex={0}>
          {t.id === "sobre" ? (
            <>
              <p>{about}</p>
              <dl>
                <div><dt>Capacidade</dt><dd>{capacity}</dd></div>
              </dl>
            </>
          ) : t.id === "comodidades" ? (
            <ul className="pd2-amen">
              {amenities.map((a) => <li key={a}>{a}</li>)}
            </ul>
          ) : (
            <>
              <ul className="pd2-extras">
                {extras.map((x) => (
                  <li key={x.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.image} alt={x.alt} loading="lazy" decoding="async" />
                    <div>
                      <b>{x.name}</b>
                      {x.description ? <p>{x.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
              <a className="pd2-link" href={whatsappHref} onClick={(e) => e.preventDefault()}>Consultar extras pelo WhatsApp</a>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
