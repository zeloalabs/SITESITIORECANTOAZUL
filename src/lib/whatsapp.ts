import type { WhatsAppContact } from "@/lib/content/types";

/** Link wa.me do contato; `null` se o número ainda não foi cadastrado. `{acomodacao}` na mensagem vira o nome da acomodação. */
export function whatsappUrl(contact: Pick<WhatsAppContact, "number" | "message"> | undefined | null, vars: { acomodacao?: string; extra?: string } = {}): string | null {
  if (!contact?.number || !/^\d{12,13}$/.test(contact.number)) return null;
  const message = contact.message
    .replaceAll("{acomodacao}", vars.acomodacao ?? "uma acomodação")
    .trim();
  const text = [message, vars.extra].filter(Boolean).join(" ");
  return text ? `https://wa.me/${contact.number}?text=${encodeURIComponent(text)}` : `https://wa.me/${contact.number}`;
}

/** Contato que atende uma acomodação: o próprio, o do grupo ou (sem nenhum) o geral. */
export function pickContact(contacts: WhatsAppContact[], keys: (string | null | undefined)[]): WhatsAppContact | undefined {
  for (const key of keys) {
    const c = key ? contacts.find((x) => x.key === key) : undefined;
    if (c) return c;
  }
  return undefined;
}
