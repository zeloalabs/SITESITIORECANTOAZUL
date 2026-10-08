import type { SeedDoc } from "./seed";

export type SeedAction = "create" | "replace" | "skip";

/**
 * Decide o que fazer com cada documento da seed ao importar para o Sanity. Nunca sobrescreve edição da proprietária:
 * - não existe → cria;
 * - `force` → substitui (uso explícito);
 * - rascunhos da Fase 1 que o site já trata como "não migrados" (acomodação sem frase/grupo; Home sem a seção
 *   `acomodacoes`) → substitui;
 * - qualquer outro documento existente → mantém.
 */
export function planSeed(existing: Record<string, unknown> | null | undefined, doc: SeedDoc, force = false): SeedAction {
  if (!existing) return "create";
  if (force) return "replace";
  if (doc._type === "accommodation" && !(existing.tagline && existing.group)) return "replace";
  if (doc._id === "page-home") {
    const sections = Array.isArray(existing.sections) ? existing.sections : [];
    if (!sections.some((s) => (s as { _type?: string })?._type === "acomodacoes")) return "replace";
  }
  return "skip";
}

const CONTACT_FIELDS: Record<string, readonly string[]> = {
  siteSettings: ["email", "instagramUrl", "mapsUrl"],
  whatsappContact: ["number", "numberFrom"],
};

/**
 * Campos de contato oficiais que faltam num documento existente (setIfMissing): preenche o vazio, nunca sobrescreve.
 * `planSeed` mantém o documento ("skip"); esta função complementa só os contatos.
 */
export function contactFill(existing: Record<string, unknown>, doc: SeedDoc): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of CONTACT_FIELDS[doc._type] ?? []) {
    const missing = existing[field] === undefined || existing[field] === null || existing[field] === "";
    if (missing && doc[field] !== undefined) out[field] = doc[field];
  }
  // `numberFrom` e `number` são alternativos: se já herda de outro contato, não acrescenta número.
  if (doc._type === "whatsappContact" && existing.numberFrom) delete out.number;
  return out;
}
