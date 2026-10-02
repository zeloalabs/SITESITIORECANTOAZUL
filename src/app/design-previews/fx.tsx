"use client";

// Efeitos de movimento dos previews. Sem dependências, só transform/opacity/clip-path.
// Cada efeito só escuta scroll enquanto está visível e respeita prefers-reduced-motion.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Mode = "through" | "sticky";

/** Escreve --p (0..1) no elemento enquanto ele está visível. Reduced motion: valor final estático. */
function useProgress<T extends HTMLElement>(ref: RefObject<T | null>, mode: Mode, resting = mode === "sticky" ? 1 : 0.5) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      el.style.setProperty("--p", String(resting));
      return;
    }
    let visible = false;
    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = mode === "through" ? (vh - r.top) / (vh + r.height) : -r.top / Math.max(1, r.height - vh);
      el.style.setProperty("--p", clamp(p).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        visible = e.isIntersecting;
        if (visible) {
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll);
          update();
        } else {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(el);
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, mode, resting]);
}

/** Entrada suave ao aparecer (opacity + translate). */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "p" | "h2" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) return; // CSS já mostra o conteúdo estático em reduced-motion
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`fx-reveal ${on ? "is-in" : ""} ${className}`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Comp>
  );
}

/** Foto com parallax sutil (~6%) dentro da moldura. `zoom` = zoom lento contínuo do hero (1 → 1,06 em 20 s). */
export function Photo({
  src,
  alt,
  focus = "50% 50%",
  className = "",
  zoom = false,
  priority = false,
  parallax = true,
}: {
  src: string;
  alt: string;
  focus?: string;
  className?: string;
  zoom?: boolean;
  priority?: boolean;
  parallax?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useProgress(ref, "through");
  return (
    <div ref={ref} className={`fx-photo ${className}`}>
      <div className={parallax ? "fx-photo-par" : "fx-photo-static"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={zoom ? "fx-zoom" : ""}
          style={{ objectPosition: focus }}
        />
      </div>
    </div>
  );
}

/** Efeito 04: texto real, palavras acendem conforme a rolagem. */
export function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useProgress(ref, "through", 1);
  const words = text.split(" ");
  return (
    <p ref={ref} className={`fx-words ${className}`} style={{ "--n": words.length } as CSSProperties}>
      {words.map((w, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

/** Divisor da serra: traço que se desenha na rolagem. Path provisório (o definitivo vem do SVG da logo). */
export function Ridge({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useProgress(ref, "through", 1);
  return (
    <div ref={ref} className={`fx-ridge ${className}`} aria-hidden="true" style={{ color }}>
      <svg viewBox="0 0 1200 70" preserveAspectRatio="none">
        <path
          pathLength={1}
          d="M0 58 C40 56 70 52 110 54 C150 56 170 40 215 36 C250 33 262 24 300 22 C330 20 352 30 392 34 C430 38 450 28 490 24 C520 21 540 14 580 12 C612 10 636 18 676 22 C716 26 744 34 790 30 C830 26 856 38 900 44 C946 50 990 42 1030 46 C1076 50 1120 54 1160 52 L1200 54"
        />
      </svg>
    </div>
  );
}

/** Efeito 02: galeria horizontal presa ao scroll (desktop). No mobile vira carrossel nativo com snap. */
export function HScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  useProgress(outer, "sticky", 0);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = outer.current;
    const t = track.current;
    if (!o || !t) return;
    const mq = window.matchMedia("(min-width: 900px)");
    const measure = () => {
      if (!mq.matches || prefersReduced()) {
        o.style.height = "";
        o.style.setProperty("--shift", "0px");
        o.dataset.native = "1";
        return;
      }
      delete o.dataset.native;
      const shift = Math.max(0, t.scrollWidth - window.innerWidth);
      o.style.setProperty("--shift", `${shift}px`);
      o.style.height = `${window.innerHeight + shift}px`;
    };
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    const imgs = Array.from(t.querySelectorAll("img"));
    imgs.forEach((i) => i.addEventListener("load", measure));
    return () => {
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
      imgs.forEach((i) => i.removeEventListener("load", measure));
    };
  }, [outer]);
  return (
    <div ref={outer} className={`fx-hscroll ${className}`}>
      <div className="fx-hscroll-stick">
        <div ref={track} className="fx-hscroll-track">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Efeito 05: foto revelada por máscara circular que se abre na rolagem. */
export function CircleReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useProgress(ref, "sticky", 1);
  return (
    <div ref={ref} className={`fx-circle ${className}`}>
      <div className="fx-circle-stick">{children}</div>
    </div>
  );
}

/** Efeito 01: pilha de cartões. Cada cartão cola no topo e o anterior recua e escurece (camada com opacidade). */
export function CardStack({ children, className = "" }: { children: ReactNode[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(":scope > .fx-card"));
    let raf = 0;
    let visible = false;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) return c.style.setProperty("--d", "0");
        const top = next.getBoundingClientRect().top;
        const d = Math.min(1, Math.max(0, 1 - top / vh));
        c.style.setProperty("--d", d.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      visible = e.isIntersecting;
      if (visible) {
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      } else window.removeEventListener("scroll", onScroll);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={root} className={`fx-stack ${className}`}>
      {children}
    </div>
  );
}
