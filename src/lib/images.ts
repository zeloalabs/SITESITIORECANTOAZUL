import { sanityDataset, sanityProjectId } from "./sanity-config";

/** Imagem pronta para renderizar. `placeholder` marca imagens de desenvolvimento (ainda sem foto real no Sanity). */
export type Img = {
  src: string;
  srcSet?: string;
  /** versão grande, para o visualizador em tela cheia */
  full?: string;
  alt: string;
  /** `object-position` derivado do ponto focal (hotspot) do Sanity */
  focus?: string;
  width?: number;
  height?: number;
  placeholder?: boolean;
};

/** Imagem como volta da GROQ (ver `IMG` em queries.ts). */
export type RawImage = {
  ref?: string | null;
  alt?: string | null;
  caption?: string | null;
  hotspot?: { x: number; y: number } | null;
  dims?: { width: number; height: number } | null;
} | null;

const REF = /^image-([A-Za-z0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/;
export const DEFAULT_WIDTHS = [480, 800, 1200, 1800, 2400] as const;

export function parseImageRef(ref: string): { id: string; width: number; height: number; ext: string } | null {
  const m = REF.exec(ref);
  if (!m) return null;
  return { id: m[1]!, width: Number(m[2]), height: Number(m[3]), ext: m[4]! };
}

export function sanityImageUrl(ref: string, width: number): string | null {
  const p = parseImageRef(ref);
  if (!p) return null;
  const w = Math.min(width, p.width);
  return `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/${p.id}-${p.width}x${p.height}.${p.ext}?w=${w}&auto=format&fit=max&q=80`;
}

export function focusOf(hotspot: { x: number; y: number } | null | undefined): string | undefined {
  if (!hotspot) return undefined;
  const pct = (n: number) => `${Math.round(Math.min(1, Math.max(0, n)) * 1000) / 10}%`;
  return `${pct(hotspot.x)} ${pct(hotspot.y)}`;
}

/** Placeholder de desenvolvimento, claramente identificável (texto "FOTO PENDENTE") e fácil de substituir no Studio. */
export function placeholderImg(label: string, opts: { width?: number; height?: number; alt?: string } = {}): Img {
  const width = opts.width ?? 1600;
  const height = opts.height ?? 1000;
  const safe = label.replace(/[<>&"']/g, "");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16264d"/><stop offset="1" stop-color="#0a1330"/></linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>` +
    `<path d="M0 ${height * 0.78} C ${width * 0.2} ${height * 0.7} ${width * 0.35} ${height * 0.5} ${width * 0.55} ${height * 0.58} S ${width * 0.85} ${height * 0.5} ${width} ${height * 0.64}" fill="none" stroke="#f3ede0" stroke-opacity=".25" stroke-width="3"/>` +
    `<g font-family="system-ui,sans-serif" fill="#f3ede0" fill-opacity=".72" text-anchor="middle">` +
    `<text x="50%" y="48%" font-size="${Math.round(height * 0.035)}" letter-spacing="6">FOTO PENDENTE</text>` +
    `<text x="50%" y="55%" font-size="${Math.round(height * 0.03)}">${safe}</text></g></svg>`;
  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    alt: opts.alt ?? label,
    width,
    height,
    placeholder: true,
  };
}

/** Converte a imagem do Sanity em `Img` responsiva; sem foto no CMS devolve um placeholder identificável. */
export function resolveImage(
  raw: RawImage | undefined,
  fallback: { label: string; alt?: string; width?: number; height?: number },
  widths: readonly number[] = DEFAULT_WIDTHS,
): Img {
  const parsed = raw?.ref ? parseImageRef(raw.ref) : null;
  if (!raw?.ref || !parsed) return placeholderImg(fallback.label, { width: fallback.width, height: fallback.height, alt: fallback.alt });
  const usable = widths.filter((w) => w <= parsed.width);
  const list = usable.length ? usable : [parsed.width];
  const largest = list[list.length - 1]!;
  const mid = list[Math.min(1, list.length - 1)]!;
  return {
    src: sanityImageUrl(raw.ref, mid)!,
    srcSet: list.map((w) => `${sanityImageUrl(raw.ref!, w)} ${w}w`).join(", "),
    full: sanityImageUrl(raw.ref, largest)!,
    alt: raw.alt?.trim() || fallback.alt || fallback.label,
    focus: focusOf(raw.hotspot),
    width: raw.dims?.width ?? parsed.width,
    height: raw.dims?.height ?? parsed.height,
  };
}
