import type { Section } from "./types";

/** Contato de WhatsApp que a página destaca (cabeçalho ou lista de extras): vira o botão flutuante direto. */
export function directContactOf(sections: Section[] | null | undefined): string | undefined {
  for (const s of sections ?? []) {
    if ((s._type === "cabecalhoPagina" || s._type === "extrasLista") && s.whatsappKey) return s.whatsappKey;
  }
  return undefined;
}
