"use client";

import { useEffect, useRef, useState } from "react";

export function HeroSearch() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sheetOpen) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foca o botão fechar ao abrir a sheet
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheetOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [sheetOpen]);

  return (
    <>
      {/* Desktop: barra de busca horizontal completa */}
      <form className="pd2-find pd2-find-desktop" aria-label="Busca de datas (demonstração)">
        <span className="f"><span className="k">Chegada</span><span className="v">Selecione</span></span>
        <span className="f"><span className="k">Partida</span><span className="v">Selecione</span></span>
        <span className="f"><span className="k">Hóspedes</span><span className="v">2 adultos</span></span>
        <button type="button" className="pd2-link" aria-disabled="true">Consultar datas</button>
      </form>

      {/* Mobile: primeiro viewport limpo com CTA direto */}
      <div className="pd2-hero-mobile-action">
        <button
          ref={triggerRef}
          type="button"
          className="pd2-link pd2-hero-mobile-btn"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
        >
          Consultar disponibilidade
        </button>
      </div>

      {/* Mobile: sheet/modal com a busca completa */}
      {sheetOpen && (
        <div
          className="pd2-sheet-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pd2-sheet-title"
        >
          <div
            className="pd2-sheet-backdrop"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="pd2-sheet-panel">
            <div className="pd2-sheet-drag" aria-hidden="true" />
            <div className="pd2-sheet-head">
              <h2 id="pd2-sheet-title">Consultar disponibilidade</h2>
              <button
                ref={closeRef}
                type="button"
                className="pd2-sheet-close"
                onClick={() => setSheetOpen(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <p className="pd2-sheet-desc">
              Selecione as datas para consultar disponibilidade e valores das acomodações.
            </p>
            <div className="pd2-sheet-fields">
              <div className="pd2-sheet-field">
                <span className="k">Chegada</span>
                <span className="v">Selecione</span>
              </div>
              <div className="pd2-sheet-field">
                <span className="k">Partida</span>
                <span className="v">Selecione</span>
              </div>
              <div className="pd2-sheet-field">
                <span className="k">Hóspedes</span>
                <span className="v">2 adultos</span>
              </div>
            </div>
            <div className="pd2-sheet-foot">
              <a
                href="#pd-stays-t"
                className="pd2-sheet-submit"
                onClick={() => setSheetOpen(false)}
              >
                Ver acomodações
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
