"use client";

// Cabeçalho fixo: transparente no topo; ao rolar fica sólido, esconde ao rolar para baixo e volta ao rolar para cima.
import { useEffect, useState, type ReactNode } from "react";

export function HeaderShell({ solid, children }: { solid: boolean; children: ReactNode }) {
  const [state, setState] = useState<"top" | "shown" | "hidden">("top");

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (y < 24) setState("top");
      else if (y > last + 6 && y > 180) setState("hidden");
      else if (y < last - 6) setState("shown");
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {solid ? <div className="pd2-head-spacer" aria-hidden="true" /> : null}
      <header className={`pd2-head ${solid ? "pd2-head--solid" : ""}`} data-state={state} onFocusCapture={() => setState((s) => (s === "hidden" ? "shown" : s))}>
        {children}
      </header>
    </>
  );
}
