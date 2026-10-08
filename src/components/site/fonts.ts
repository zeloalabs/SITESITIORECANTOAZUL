import type { CSSProperties } from "react";

// Fontes provisórias da D2 (decisão final em aberto): Par 1 no desktop e Par 2 no mobile; ?fonts=1|2 força um par nos previews.
// Carregadas do Google Fonts; o plano prevê self-host antes do lançamento.
export const fontPair1 = {
  label: "Fraunces + Figtree",
  href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,300;1,9..144,200;1,9..144,300&family=Figtree:wght@300;400;500&display=swap",
  display: "'Fraunces', Georgia, serif",
  body: "'Figtree', system-ui, sans-serif",
} as const;

export const fontPair2 = {
  label: "Bodoni Moda + Albert Sans",
  href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Albert+Sans:wght@300;400;500&display=swap",
  display: "'Bodoni Moda', Georgia, serif",
  body: "'Albert Sans', system-ui, sans-serif",
} as const;

export function d2Fonts(fonts?: string) {
  const mode = fonts === "1" || fonts === "2" ? fonts : "auto";
  const a = fontPair1;
  const b = fontPair2;
  const style = { "--f1d": a.display, "--f1b": a.body, "--f2d": b.display, "--f2b": b.body } as CSSProperties;
  return { mode, style, hrefs: mode === "auto" ? [a.href, b.href] : [mode === "1" ? a.href : b.href], className: `pd2 f-${mode}` };
}
