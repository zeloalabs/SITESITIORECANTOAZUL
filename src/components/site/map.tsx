"use client";

// Mapa do Google com carregamento sob demanda (privacidade e desempenho): o iframe só entra depois do clique.
import { useState } from "react";

export function MapFacade({ embed, mapsUrl }: { embed: string; mapsUrl: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="pd2-map">
      {on ? (
        <iframe title="Mapa: Sítio Recanto Azul" src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <div className="facade">
          <svg viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 58 C40 56 70 52 110 54 C150 56 170 40 215 36 C250 33 262 24 300 22 C330 20 352 30 392 34 C430 38 450 28 490 24 C520 21 540 14 580 12 C612 10 636 18 676 22 C716 26 744 34 790 30 C830 26 856 38 900 44 C946 50 990 42 1030 46 C1076 50 1120 54 1160 52 L1200 54" />
          </svg>
          <button type="button" className="pd2-link" onClick={() => setOn(true)}>Ver mapa</button>
          <p>Ao carregar, o Google pode usar cookies. <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a></p>
        </div>
      )}
    </div>
  );
}
