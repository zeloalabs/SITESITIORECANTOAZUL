import "server-only";
import { cache } from "react";
import { sanityFetch } from "./client";
import { seedDocuments } from "./seed";
import {
  ACCOMMODATION_QUERY,
  ACCOMMODATION_SLUGS_QUERY,
  EXPERIENCES_QUERY,
  EXTRAS_QUERY,
  FAQS_QUERY,
  PAGE_QUERY,
  POLICIES_QUERY,
  REVIEWS_QUERY,
  SITE_QUERY,
} from "./queries";
import {
  normalizeContacts,
  normalizeExperiences,
  normalizeExtras,
  normalizeFaqs,
  normalizeGroups,
  normalizePolicies,
  normalizeReviews,
  normalizeSections,
  normalizeSettings,
  normalizeStay,
  type RawStay,
} from "./normalize";
import type { Accommodation, Experience, Extra, Faq, PageDoc, Policy, Review, SiteChrome } from "./types";

export type Params = Record<string, string>;
/** Executa uma GROQ no Sanity; devolve `null` se indisponível. */
export type Fetcher = (query: string, params?: Params) => Promise<unknown>;

/** Seed avaliada com a mesma GROQ (groq-js). Fallback quando o Sanity está inacessível ou o conteúdo ainda não foi migrado. */
export const seedFetcher: Fetcher = async (query, params = {}) => {
  const { parse, evaluate } = await import("groq-js");
  const result = await evaluate(parse(query, { params }), { dataset: seedDocuments, params });
  return result.get();
};

export const sanityFetcher: Fetcher = async (query, params = {}) => {
  try {
    const { data } = await sanityFetch({ query, params });
    return data;
  } catch (error) {
    // Só a mensagem (sem objeto de erro/headers) para nunca registrar token.
    console.error("[content] Sanity indisponível; usando conteúdo-base.", error instanceof Error ? error.message.slice(0, 160) : "erro");
    return null;
  }
};

const fallbackEnabled = () => process.env.CONTENT_FALLBACK !== "off";

type Raw = Record<string, unknown> | null | undefined;
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export function createContent(live: Fetcher, seed: Fetcher = seedFetcher) {
  /** Sanity primeiro; se vazio/indisponível (e o fallback estiver ligado), a seed. */
  async function pick<T>(query: string, params: Params | undefined, usable: (v: unknown) => v is T): Promise<T | null> {
    const fromLive = await live(query, params);
    if (usable(fromLive)) return fromLive;
    if (!fallbackEnabled()) return null;
    const fromSeed = await seed(query, params);
    return usable(fromSeed) ? fromSeed : null;
  }
  const nonEmptyArray = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0;
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

  return {
    async chrome(): Promise<SiteChrome> {
      const ok = (v: unknown): v is Record<string, unknown> => object(v) && object(v.settings) && nonEmptyArray(v.groups);
      const raw = (await pick(SITE_QUERY, undefined, ok)) as Raw;
      return {
        settings: normalizeSettings(raw?.settings as never),
        contacts: normalizeContacts(arr(raw?.contacts) as never),
        groups: normalizeGroups(arr(raw?.groups) as never),
      };
    },

    async accommodation(slug: string): Promise<Accommodation | null> {
      // "Migrada" = já tem frase de apresentação e grupo; os stubs da Fase 1 (só nome/slug/roomId) caem na seed.
      const migrated = (v: unknown): v is RawStay => object(v) && Boolean(v.tagline) && Boolean(v.groupId);
      const raw = await pick<RawStay>(ACCOMMODATION_QUERY, { slug }, migrated);
      return normalizeStay(raw);
    },

    async accommodationSlugs(): Promise<string[]> {
      const slugs = await pick<string[]>(ACCOMMODATION_SLUGS_QUERY, undefined, nonEmptyArray as never);
      return (slugs ?? []).map(String);
    },

    async page(slug: string): Promise<PageDoc | null> {
      // A Home da Fase 1 (só hero + texto de teste) não tem a seção "acomodacoes": enquanto não migrar, usa a seed.
      const usable = (v: unknown): v is Record<string, unknown> =>
        object(v) && (slug !== "home" || arr(v.sections).some((s) => object(s) && s._type === "acomodacoes"));
      const raw = await pick(PAGE_QUERY, { slug }, usable);
      if (!raw) return null;
      return {
        _id: String(raw._id),
        title: String(raw.title ?? ""),
        slug: String(raw.slug ?? slug),
        sections: normalizeSections(arr(raw.sections) as never),
        seoTitle: (raw.seoTitle as string | undefined) ?? undefined,
        seoDescription: (raw.seoDescription as string | undefined) ?? undefined,
      };
    },

    async extras(): Promise<Extra[]> {
      return normalizeExtras((await pick(EXTRAS_QUERY, undefined, nonEmptyArray)) as never);
    },
    async experiences(): Promise<Experience[]> {
      return normalizeExperiences((await pick(EXPERIENCES_QUERY, undefined, nonEmptyArray)) as never);
    },
    async faqs(): Promise<Faq[]> {
      return normalizeFaqs((await pick(FAQS_QUERY, undefined, nonEmptyArray)) as never);
    },
    async policies(): Promise<Policy[]> {
      return normalizePolicies((await pick(POLICIES_QUERY, undefined, nonEmptyArray)) as never);
    },
    async reviews(): Promise<Review[]> {
      return normalizeReviews((await pick(REVIEWS_QUERY, undefined, nonEmptyArray)) as never);
    },
  };
}

const content = createContent(sanityFetcher);

// `cache` do React: uma consulta por requisição, mesmo que cabeçalho, página e rodapé a peçam.
export const getChrome = cache(() => content.chrome());
export const getAccommodation = cache((slug: string) => content.accommodation(slug));
export const getAccommodationSlugs = cache(() => content.accommodationSlugs());
export const getPage = cache((slug: string) => content.page(slug));
export const getExtras = cache(() => content.extras());
export const getExperiences = cache(() => content.experiences());
export const getFaqs = cache(() => content.faqs());
export const getPolicies = cache(() => content.policies());
export const getReviews = cache(() => content.reviews());
