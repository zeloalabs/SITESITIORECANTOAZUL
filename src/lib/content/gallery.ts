import type { Accommodation } from "./types";
import { placeholderImg } from "@/lib/images";

export type StayPhoto = { src: string; w: number; h: number; alt?: string; srcSet?: string; full?: string };

/**
 * Fotos da galeria da acomodação, na ordem do CMS, com largura/altura reais (sem CLS).
 * Sem fotos no CMS: em desenvolvimento mostra placeholders identificáveis; em produção a seção some.
 */
export function galleryPhotos(stay: Pick<Accommodation, "name" | "gallery">, devPlaceholders: boolean): StayPhoto[] {
  if (stay.gallery.length) {
    return stay.gallery.map((g) => ({ src: g.img.src, srcSet: g.img.srcSet, full: g.img.full, alt: g.img.alt, w: g.width, h: g.height }));
  }
  if (!devPlaceholders) return [];
  return Array.from({ length: 8 }, (_, i) => {
    const portrait = i % 3 === 0;
    const p = placeholderImg(`${stay.name} — foto ${i + 1}`, portrait ? { width: 1200, height: 1500 } : { width: 1500, height: 1000 });
    return { src: p.src, alt: p.alt, w: p.width ?? 1500, h: p.height ?? 1000 };
  });
}
