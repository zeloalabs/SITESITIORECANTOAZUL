import type { Img, WhatsAppContact } from "@/lib/content/types";
import type { WaGroup } from "./whatsapp";
import { whatsappUrl } from "@/lib/whatsapp";

/** Props de `<Photo>` a partir de uma imagem resolvida. */
export const photo = (i: Img) => ({ src: i.src, srcSet: i.srcSet, alt: i.alt, focus: i.focus });

/** Contatos → itens do seletor de WhatsApp. `href: null` = número ainda não cadastrado. */
export function waGroups(contacts: WhatsAppContact[], vars: { acomodacao?: string; extra?: string } = {}): WaGroup[] {
  return contacts.map((c) => ({ id: c.key, name: c.label, href: whatsappUrl(c, vars) }));
}

export const stayHref = (slug: string) => `/acomodacoes/${slug}`;
