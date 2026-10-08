import type { Img } from "@/lib/images";

export type { Img };

/* ---------- configuração e contatos ---------- */

export type SiteSettings = {
  siteName: string;
  tagline: string;
  place: string;
  email: string | null;
  instagramUrl: string | null;
  address: string | null;
  mapsUrl: string;
  mapsEmbedUrl: string;
  galleryInitial: number;
  seoTitle: string | null;
  seoDescription: string | null;
  beds24PropertyId: number | null;
  beds24Referer: string;
  bookingUrlOverride: string | null;
};

/** `number` = só dígitos com DDI, já resolvido (herdado de outro contato, se for o caso). `null` = ainda não cadastrado. */
export type WhatsAppContact = { key: string; label: string; number: string | null; message: string };

/* ---------- acomodações ---------- */

export type GuestRules = { minAdults: number; maxAdults?: number; maxChildren?: number; maxTotal: number; hint: string };

export type Extra = { id: string; name: string; description: string | null; image: Img };

export type AccommodationCard = { slug: string; name: string; tagline: string; capacityLabel: string; cover: Img };

export type AccommodationGroup = {
  id: string;
  name: string;
  intro: string | null;
  showOnHome: boolean;
  whatsappKey: string | null;
  stays: AccommodationCard[];
};

export type GalleryItem = { img: Img; width: number; height: number };

export type Accommodation = AccommodationCard & {
  groupId: string | null;
  groupName: string | null;
  detail: string[];
  highlights: string[];
  amenities: string[];
  gallery: GalleryItem[];
  guests: GuestRules;
  capacity: number | null;
  beds24RoomId: number | null;
  whatsappKey: string | null;
  extras: Extra[];
  seoTitle: string | null;
  seoDescription: string | null;
};

/* ---------- conteúdo editorial ---------- */

export type Experience = { id: string; name: string; text: string; image: Img | null; showOnHome: boolean };
export type Faq = { id: string; question: string; answer: string };
export type Review = { id: string; quote: string; author: string; source: string | null; when: string | null };
export type Policy = { id: string; anchor: string; title: string; paragraphs: string[] };

/* ---------- seções (page builder), já normalizadas ---------- */

type Base = { _key: string };
export type HeroSection = Base & { _type: "hero"; title: string; text?: string; image?: Img; showSearch?: boolean; eyebrow?: string };
export type TextoEditorialSection = Base & { _type: "textoEditorial"; eyebrow?: string; title?: string; body?: unknown[] };
export type CabecalhoPaginaSection = Base & { _type: "cabecalhoPagina"; title: string; lead?: string; whatsappKey?: string; whatsappLabel?: string };
export type IntroSection = Base & { _type: "intro"; title: string; text?: string; facts: string[]; photos: { image: Img; caption?: string }[] };
export type AcomodacoesSection = Base & { _type: "acomodacoes"; title: string };
export type BlocosDestaqueSection = Base & { _type: "blocosDestaque"; title: string; tiles: { title: string; text?: string; image: Img; href: string }[] };
export type FotoCheiaSection = Base & { _type: "fotoCheia"; image: Img; caption?: string };
export type ExperienciasBlocoSection = Base & { _type: "experienciasBloco"; title: string; lead?: string; onlyHome: boolean; photos: Img[]; linkLabel?: string; linkHref?: string };
export type ExtrasListaSection = Base & { _type: "extrasLista"; whatsappKey?: string };
export type PoliticasListaSection = Base & { _type: "politicasLista" };
export type FaqListaSection = Base & { _type: "faqLista" };
export type TextoComFotoSection = Base & { _type: "textoComFoto"; title: string; paragraphs: string[]; image: Img };
export type LocalizacaoSection = Base & { _type: "localizacao"; title: string; text?: string; note?: string };
export type DepoimentoSection = Base & { _type: "depoimento"; reviewId?: string };
export type ChamadaFinalSection = Base & { _type: "chamadaFinal"; title: string; image: Img };
export type ContatoBlocoSection = Base & { _type: "contatoBloco"; title?: string };

export type Section =
  | HeroSection
  | TextoEditorialSection
  | CabecalhoPaginaSection
  | IntroSection
  | AcomodacoesSection
  | BlocosDestaqueSection
  | FotoCheiaSection
  | ExperienciasBlocoSection
  | ExtrasListaSection
  | PoliticasListaSection
  | FaqListaSection
  | TextoComFotoSection
  | LocalizacaoSection
  | DepoimentoSection
  | ChamadaFinalSection
  | ContatoBlocoSection;

export type PageDoc = {
  _id: string;
  title: string;
  slug: string;
  sections: Section[] | null;
  seoTitle?: string;
  seoDescription?: string;
};

/** Tudo que o cabeçalho, o rodapé e as seções dinâmicas precisam. */
export type SiteChrome = {
  settings: SiteSettings;
  contacts: WhatsAppContact[];
  groups: AccommodationGroup[];
};
