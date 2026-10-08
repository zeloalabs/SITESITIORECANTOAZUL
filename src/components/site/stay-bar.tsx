"use client";

// Barra fixa de conversão (só mobile) da página de acomodação: Reservar + WhatsApp (quando há número).
// Aparece depois do hero e some quando a seção "Reserve sua estadia" está na tela, para não duplicar os botões.
import { useEffect, useState } from "react";

type Props = { name: string; reserveHref: string | null; whatsappHref: string | null; sectionId: string };

export function StayBar({ name, reserveHref, whatsappHref, sectionId }: Props) {
  const [past, setPast] = useState(false);
  const [inSection, setInSection] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => setInSection(entries[0]?.isIntersecting ?? false), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [sectionId]);

  if (!reserveHref && !whatsappHref) return null;
  const shown = past && !inSection;
  return (
    <div className={`stay-bar ${shown ? "" : "is-off"}`} role="region" aria-label={`Reservar ${name}`}>
      {reserveHref ? (
        <a className="stay-bar-main" href={reserveHref} target="_blank" rel="noopener noreferrer" tabIndex={shown ? undefined : -1}>
          Reservar<span className="sr"> — {name} (abre o motor de reservas em nova aba)</span>
        </a>
      ) : null}
      {whatsappHref ? (
        <a className="stay-bar-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer" tabIndex={shown ? undefined : -1}>
          WhatsApp<span className="sr"> (nova aba)</span>
        </a>
      ) : null}
    </div>
  );
}
