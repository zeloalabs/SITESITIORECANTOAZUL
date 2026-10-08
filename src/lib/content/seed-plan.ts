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
