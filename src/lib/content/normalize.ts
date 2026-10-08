// Converte o que a GROQ devolve (campos opcionais, imagens cruas) nos tipos fortes do site. Puro e testável.
import { stegaClean } from "next-sanity";
import { resolveImage, type RawImage } from "@/lib/images";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import type {
  Accommodation,
  AccommodationCard,
  AccommodationGroup,
  Experience,
  Extra,
  Faq,
  GuestRules,
  Policy,
  Review,
  Section,
  SiteSettings,
  WhatsAppContact,
} from "./types";

type Maybe<T> = T | null | undefined;
const clean = (s: Maybe<string>): string | undefined => (typeof s === "string" ? stegaClean(s) : undefined);
const text = (s: Maybe<string>): string | undefined => (typeof s === "string" && s.trim() ? s : undefined);

/** Separa parágrafos por linha em branco (campos de texto simples do Studio). */
export function paragraphs(value: Maybe<string>): string[] {
  if (!value) return [];
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const DEFAULT_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Sitio+Recanto+Azul+Alfredo+Wagner+SC";

/* ---------- configurações e contatos ---------- */

export type RawSettings = Partial<Omit<SiteSettings, "galleryInitial" | "seoImage">> & { galleryInitial?: number | null; seoImage?: RawImage };

export function normalizeSettings(raw: Maybe<RawSettings>): SiteSettings {
  const r = raw ?? {};
  const https = (u: Maybe<string>) => (u && /^https:\/\//.test(clean(u) ?? "") ? clean(u)! : null);
  return {
    siteName: text(r.siteName) ?? "Sítio Recanto Azul",
    tagline: text(r.tagline) ?? "Natureza, privacidade e experiências para casais e grupos",
    place: text(r.place) ?? "Alfredo Wagner · SC",
    email: text(r.email) ?? null,
    instagramUrl: https(r.instagramUrl),
    address: text(r.address) ?? null,
    mapsUrl: https(r.mapsUrl) ?? DEFAULT_MAPS_URL,
    mapsEmbedUrl: https(r.mapsEmbedUrl) ?? "",
    galleryInitial: Number.isInteger(r.galleryInitial) && (r.galleryInitial as number) > 0 ? (r.galleryInitial as number) : 8,
    seoTitle: text(r.seoTitle) ?? null,
    seoDescription: text(r.seoDescription) ?? null,
    seoImage: r.seoImage?.ref ? resolveImage(r.seoImage, { label: "Imagem social" }) : null,
    beds24PropertyId: Number.isInteger(r.beds24PropertyId) && (r.beds24PropertyId as number) > 0 ? (r.beds24PropertyId as number) : null,
    beds24Referer: clean(r.beds24Referer)?.trim() || "site-v2",
    bookingUrlOverride: clean(r.bookingUrlOverride) ?? null,
  };
}

export type RawContact = { key?: string | null; label?: string | null; message?: string | null; number?: string | null };

export function normalizeContacts(raw: Maybe<RawContact[]>): WhatsAppContact[] {
  return (raw ?? [])
    .filter((c) => c.key && c.label)
    .map((c) => {
      const number = clean(c.number)?.replace(/\D/g, "") ?? "";
      return { key: clean(c.key)!, label: c.label!, message: c.message ?? "", number: normalizeWhatsappNumber(number) };
    });
}

/* ---------- acomodações ---------- */

type RawStayCard = { slug?: string | null; name?: string | null; tagline?: string | null; capacityLabel?: string | null; cover?: RawImage; first?: RawImage };

export function normalizeStayCard(raw: RawStayCard): AccommodationCard | null {
  const slug = clean(raw.slug);
  if (!slug || !raw.name) return null;
  return {
    slug,
    name: raw.name,
    tagline: raw.tagline ?? "",
    capacityLabel: raw.capacityLabel ?? "",
    cover: resolveImage(raw.cover?.ref ? raw.cover : raw.first, { label: `${raw.name} — capa`, alt: raw.name }),
  };
}

export type RawGroup = { id?: string | null; name?: string | null; intro?: string | null; showOnHome?: boolean | null; whatsappKey?: string | null; stays?: RawStayCard[] | null };

export function normalizeGroups(raw: Maybe<RawGroup[]>): AccommodationGroup[] {
  return (raw ?? [])
    .filter((g) => g.id && g.name)
    .map((g) => ({
      id: clean(g.id)!,
      name: g.name!,
      intro: text(g.intro) ?? null,
      showOnHome: g.showOnHome !== false,
      whatsappKey: clean(g.whatsappKey) ?? null,
      stays: (g.stays ?? []).map(normalizeStayCard).filter((s): s is AccommodationCard => s !== null),
    }));
}

type RawExtra = { id?: string | null; name?: string | null; description?: string | null; image?: RawImage };

export function normalizeExtras(raw: Maybe<RawExtra[]>): Extra[] {
  return (raw ?? [])
    .filter((e) => e.id && e.name)
    .map((e) => ({
      id: clean(e.id)!,
      name: e.name!,
      description: text(e.description) ?? null,
      image: resolveImage(e.image, { label: `Extra — ${e.name}`, alt: e.name! }),
    }));
}

export type RawStay = RawStayCard & {
  detail?: string | null;
  highlights?: string[] | null;
  amenities?: string[] | null;
  capacity?: number | null;
  minAdults?: number | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  maxGuests?: number | null;
  guestHint?: string | null;
  beds24RoomId?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  whatsappKey?: string | null;
  gallery?: RawImage[] | null;
  extras?: RawExtra[] | null;
};

export function guestRulesOf(raw: Pick<RawStay, "minAdults" | "maxAdults" | "maxChildren" | "maxGuests" | "capacity" | "guestHint">): GuestRules {
  const maxTotal = raw.maxGuests ?? raw.capacity ?? 2;
  return {
    minAdults: Math.max(1, raw.minAdults ?? 1),
    ...(raw.maxAdults != null ? { maxAdults: raw.maxAdults } : {}),
    ...(raw.maxChildren != null ? { maxChildren: raw.maxChildren } : {}),
    maxTotal,
    hint: raw.guestHint ?? "",
  };
}

export function normalizeStay(raw: Maybe<RawStay>): Accommodation | null {
  if (!raw) return null;
  const card = normalizeStayCard(raw);
  if (!card) return null;
  return {
    ...card,
    groupId: clean(raw.groupId) ?? null,
    groupName: raw.groupName ?? null,
    detail: paragraphs(raw.detail),
    highlights: raw.highlights ?? [],
    amenities: raw.amenities ?? [],
    gallery: (raw.gallery ?? [])
      .filter((g) => g?.ref)
      .map((g, i) => {
        const img = resolveImage(g, { label: `${card.name} — foto ${i + 1}`, alt: `${card.name}, foto ${i + 1}` });
        return { img, width: img.width ?? 1600, height: img.height ?? 1000 };
      }),
    guests: guestRulesOf(raw),
    capacity: raw.capacity ?? null,
    beds24RoomId: Number.isInteger(raw.beds24RoomId) && (raw.beds24RoomId as number) > 0 ? (raw.beds24RoomId as number) : null,
    whatsappKey: clean(raw.whatsappKey) ?? null,
    extras: normalizeExtras(raw.extras),
    seoTitle: text(raw.seoTitle) ?? null,
    seoDescription: text(raw.seoDescription) ?? null,
  };
}

/* ---------- conteúdo editorial ---------- */

type RawExperience = { id?: string | null; name?: string | null; text?: string | null; showOnHome?: boolean | null; image?: RawImage };

export function normalizeExperiences(raw: Maybe<RawExperience[]>): Experience[] {
  return (raw ?? [])
    .filter((e) => e.id && e.name && e.text)
    .map((e) => ({
      id: clean(e.id)!,
      name: e.name!,
      text: e.text!,
      showOnHome: e.showOnHome !== false,
      image: e.image?.ref ? resolveImage(e.image, { label: `Experiência — ${e.name}`, alt: e.name! }) : null,
    }));
}

export function normalizeFaqs(raw: Maybe<{ id?: string | null; question?: string | null; answer?: string | null }[]>): Faq[] {
  return (raw ?? []).filter((f) => f.id && f.question && f.answer).map((f) => ({ id: clean(f.id)!, question: f.question!, answer: f.answer! }));
}

export function normalizePolicies(raw: Maybe<{ id?: string | null; anchor?: string | null; title?: string | null; body?: string | null }[]>): Policy[] {
  return (raw ?? [])
    .filter((p) => p.id && p.anchor && p.title && p.body)
    .map((p) => ({ id: clean(p.id)!, anchor: clean(p.anchor)!, title: p.title!, paragraphs: paragraphs(p.body) }));
}

export function normalizeReviews(raw: Maybe<{ id?: string | null; quote?: string | null; author?: string | null; source?: string | null; when?: string | null }[]>): Review[] {
  return (raw ?? [])
    .filter((r) => r.id && r.quote && r.author)
    .map((r) => ({ id: clean(r.id)!, quote: r.quote!, author: r.author!, source: text(r.source) ?? null, when: text(r.when) ?? null }));
}

/* ---------- seções ---------- */

type RawSection = {
  _key?: string;
  _type?: string;
  title?: string | null;
  lead?: string | null;
  text?: string | null;
  note?: string | null;
  caption?: string | null;
  linkLabel?: string | null;
  linkHref?: string | null;
  whatsappKey?: string | null;
  whatsappLabel?: string | null;
  onlyHome?: boolean | null;
  body?: unknown;
  eyebrow?: string | null;
  showSearch?: boolean | null;
  facts?: string[] | null;
  image?: RawImage;
  reviewId?: string | null;
  photos?: (RawImage | { image?: RawImage; caption?: string | null })[] | null;
  tiles?: { _key?: string; title?: string | null; text?: string | null; href?: string | null; image?: RawImage }[] | null;
};

/** Só aceita caminho interno ou https (defesa extra além da validação do Studio). */
export function safeHref(href: Maybe<string>): string | undefined {
  const h = clean(href)?.trim();
  if (!h) return undefined;
  return /^\/(?!\/)[^\s]*$/.test(h) || /^https:\/\/[^\s]+$/.test(h) ? h : undefined;
}

export function normalizeSection(raw: RawSection): Section | null {
  const _key = raw._key ?? Math.random().toString(36).slice(2);
  const opt = <T extends object>(o: T) => o;
  switch (raw._type) {
    case "hero":
      if (!raw.title) return null;
      return { _type: "hero", _key, title: raw.title, text: text(raw.text), eyebrow: text(raw.eyebrow), showSearch: raw.showSearch !== false, image: resolveImage(raw.image, { label: "Hero — foto de capa", alt: raw.title, width: 2400, height: 1600 }) };
    case "textoEditorial":
      return { _type: "textoEditorial", _key, eyebrow: text(raw.eyebrow), title: text(raw.title), body: Array.isArray(raw.body) ? raw.body : undefined };
    case "cabecalhoPagina":
      if (!raw.title) return null;
      return { _type: "cabecalhoPagina", _key, title: raw.title, lead: text(raw.lead), whatsappKey: clean(raw.whatsappKey), whatsappLabel: text(raw.whatsappLabel) };
    case "intro":
      if (!raw.title) return null;
      return {
        _type: "intro", _key, title: raw.title, text: text(raw.text),
        facts: (raw.facts ?? []).map((f) => text(f)).filter((f): f is string => !!f),
        photos: (raw.photos ?? []).slice(0, 2).map((p, i) => {
          const o = p as { image?: RawImage; caption?: string | null };
          return { image: resolveImage(o.image, { label: o.caption ?? `Introdução — foto ${i + 1}`, alt: o.caption ?? undefined }), caption: text(o.caption) };
        }),
      };
    case "acomodacoes":
      return { _type: "acomodacoes", _key, title: raw.title || "Acomodações" };
    case "blocosDestaque":
      if (!raw.title) return null;
      return {
        _type: "blocosDestaque", _key, title: raw.title,
        tiles: (raw.tiles ?? [])
          .map((t) => ({ title: t.title ?? "", text: text(t.text), href: safeHref(t.href) ?? "", image: resolveImage(t.image, { label: `Destaque — ${t.title ?? ""}`, alt: t.title ?? undefined }) }))
          .filter((t) => t.title && t.href),
      };
    case "fotoCheia":
      return { _type: "fotoCheia", _key, caption: text(raw.caption), image: resolveImage(raw.image, { label: raw.caption ?? "Foto em tela cheia", alt: raw.caption ?? undefined, width: 2400, height: 1400 }) };
    case "experienciasBloco":
      if (!raw.title) return null;
      return opt({
        _type: "experienciasBloco" as const, _key, title: raw.title, lead: text(raw.lead), onlyHome: raw.onlyHome !== false,
        photos: ((raw.photos ?? []) as RawImage[]).slice(0, 3).map((p, i) => resolveImage(p, { label: `Experiências — foto ${i + 1}`, width: 1200, height: 1500 })),
        linkLabel: text(raw.linkLabel), linkHref: safeHref(raw.linkHref),
      });
    case "extrasLista":
      return { _type: "extrasLista", _key, whatsappKey: clean(raw.whatsappKey) };
    case "politicasLista":
      return { _type: "politicasLista", _key };
    case "faqLista":
      return { _type: "faqLista", _key };
    case "textoComFoto":
      if (!raw.title) return null;
      return { _type: "textoComFoto", _key, title: raw.title, paragraphs: paragraphs(typeof raw.body === "string" ? raw.body : undefined), image: resolveImage(raw.image, { label: raw.title, alt: raw.title, width: 2000, height: 1300 }) };
    case "localizacao":
      return { _type: "localizacao", _key, title: raw.title || "Localização", text: text(raw.text), note: text(raw.note) };
    case "depoimento":
      return { _type: "depoimento", _key, reviewId: clean(raw.reviewId) };
    case "chamadaFinal":
      if (!raw.title) return null;
      return { _type: "chamadaFinal", _key, title: raw.title, image: resolveImage(raw.image, { label: "Chamada final — foto de fundo", alt: raw.title, width: 2400, height: 1500 }) };
    case "contatoBloco":
      return { _type: "contatoBloco", _key, title: text(raw.title) };
    default:
      return null;
  }
}

export function normalizeSections(raw: Maybe<RawSection[]>): Section[] {
  return (raw ?? []).map(normalizeSection).filter((s): s is Section => s !== null);
}
