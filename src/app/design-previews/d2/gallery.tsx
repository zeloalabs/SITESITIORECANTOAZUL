"use client";

// Galeria da acomodação: todas as fotos em proporção original (sem recorte) + visualizador em tela cheia.
// Fase 2: fotos de demonstração da Biblioteca Oficial. No CMS: array de imagens por acomodação (sem limite), com alt e ordem editáveis.
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryPhoto = { src: string; w: number; h: number };

export function StayGallery({ name, photos, initial = 8 }: { name: string; photos: GalleryPhoto[]; initial?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const top = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const n = photos.length;
  const shown = all ? photos : photos.slice(0, initial);
  const extra = n - initial;

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    history.pushState({ gallery: true }, "");
    const onPop = () => {
      setOpen(null);
      opener.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") history.back();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && box.current) {
        const f = box.current.querySelectorAll<HTMLElement>("button");
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    box.current?.querySelector<HTMLElement>(".close")?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
    };
  }, [open === null, go]); // eslint-disable-line react-hooks/exhaustive-deps

  // pré-carrega as vizinhas
  useEffect(() => {
    if (open === null) return;
    for (const d of [-1, 1]) {
      const p = photos[(open + d + n) % n];
      if (p) new Image().src = p.src;
    }
  }, [open, n, photos]);

  const cur = open === null ? null : photos[open];

  return (
    <>
      <ul className="pd2-gal" ref={top}>
        {shown.map((p, i) => (
          <li key={p.src} className={i >= initial ? "late" : undefined}>
            <button
              type="button"
              aria-label={`Ampliar foto ${i + 1} de ${n} — ${name}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} width={p.w} height={p.h} alt={`${name}, foto ${i + 1} de ${n}`} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      {extra > 0 ? (
        <div className="pd2-gal-more">
          <button
            type="button"
            className="pd2-link"
            aria-expanded={all}
            onClick={() => {
              if (all) top.current?.scrollIntoView({ block: "start" });
              setAll((v) => !v);
            }}
          >
            {all ? "Mostrar menos" : `Ver todas as fotos (${n})`}
          </button>
        </div>
      ) : null}

      {cur && open !== null ? (
        <div
          ref={box}
          className="pd2-lb"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${name}`}
          onPointerDown={(e) => (touch.current = e.clientX)}
          onPointerUp={(e) => {
            if (touch.current !== null && Math.abs(e.clientX - touch.current) > 56) go(e.clientX < touch.current ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="lb-top">
            <p>{name}</p>
            <button type="button" className="close" onClick={() => history.back()}>Fechar</button>
          </div>
          <div className="lb-stage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={cur.src} src={cur.src} alt={`${name}, foto ${open + 1} de ${n}`} draggable={false} />
          </div>
          <div className="lb-bar">
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior">← Anterior</button>
            <span aria-live="polite">{open + 1} / {n}</span>
            <button type="button" onClick={() => go(1)} aria-label="Próxima foto">Próxima →</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
