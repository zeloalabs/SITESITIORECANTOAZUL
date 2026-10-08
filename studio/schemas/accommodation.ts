import { defineField, defineType } from "sanity";
import { photoField } from "./fields";

export function validateOcupacaoReferencia(value: number | undefined): true | string {
  if (value === undefined) return "Obrigatório";
  if (!Number.isInteger(value) || value < 1 || value > 20) return "Use um número inteiro de 1 a 20";
  return true;
}

export function validateBeds24RoomId(value: number | undefined): true | string {
  if (value === undefined) return true;
  if (!Number.isInteger(value) || value <= 0) return "roomId da Beds24 deve ser inteiro positivo";
  return true;
}

/** Regras de hóspedes: totais inteiros positivos e coerentes entre si. */
export function validateGuestRules(rules: { minAdults?: number; maxAdults?: number; maxChildren?: number; maxGuests?: number }): true | string {
  const { minAdults = 1, maxAdults, maxChildren, maxGuests } = rules;
  for (const [label, v] of [["Mínimo de adultos", minAdults], ["Máximo de adultos", maxAdults], ["Máximo de crianças", maxChildren], ["Máximo de hóspedes", maxGuests]] as const) {
    if (v !== undefined && (!Number.isInteger(v) || v < 0)) return `${label}: use um número inteiro (0 ou mais)`;
  }
  if (minAdults < 1) return "É necessário pelo menos 1 adulto";
  if (maxGuests === undefined) return "Informe o máximo de hóspedes";
  if (maxAdults !== undefined && maxAdults < minAdults) return "Máximo de adultos não pode ser menor que o mínimo";
  if (maxAdults !== undefined && maxAdults > maxGuests) return "Máximo de adultos não pode passar do máximo de hóspedes";
  return true;
}

export const accommodation = defineType({
  name: "accommodation",
  title: "Acomodação",
  type: "document",
  fieldsets: [
    { name: "guests", title: "Hóspedes", options: { columns: 2 } },
    { name: "booking", title: "Reserva (Beds24)", options: { collapsible: true, collapsed: true } },
    { name: "seo", title: "SEO", options: { collapsible: true, collapsed: true } },
  ],
  validation: (r) =>
    r.custom((doc) => {
      const d = doc as { minAdults?: number; maxAdults?: number; maxChildren?: number; maxGuests?: number } | undefined;
      return d ? validateGuestRules(d) : true;
    }),
  fields: [
    defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "group", title: "Grupo", type: "reference", to: [{ type: "accommodationGroup" }], validation: (r) => r.required() }),
    defineField({ name: "order", title: "Ordem dentro do grupo", type: "number", initialValue: 0 }),
    defineField({ name: "tagline", title: "Diferencial (frase curta)", description: "Aparece nas listas e no topo da página.", type: "string", validation: (r) => r.required().max(120) }),
    defineField({ name: "detail", title: "Texto da aba Sobre", description: "Separe parágrafos com uma linha em branco.", type: "text", rows: 5 }),
    defineField({ name: "capacityLabel", title: "Rótulo de capacidade", description: "Texto exibido, ex.: Até 2 adultos e 2 crianças.", type: "string", validation: (r) => r.required() }),
    defineField({ name: "capacity", title: "Capacidade máxima (número)", type: "number", validation: (r) => r.integer().positive() }),
    defineField({ name: "minAdults", title: "Mínimo de adultos", type: "number", initialValue: 1, fieldset: "guests" }),
    defineField({ name: "maxAdults", title: "Máximo de adultos", type: "number", fieldset: "guests" }),
    defineField({ name: "maxChildren", title: "Máximo de crianças", type: "number", fieldset: "guests" }),
    defineField({ name: "maxGuests", title: "Máximo de hóspedes (total)", type: "number", fieldset: "guests" }),
    defineField({ name: "guestHint", title: "Texto de limite no seletor", description: "Ex.: Máximo: 2 adultos e 2 crianças. Aceitamos pets sem custo extra.", type: "string" }),
    defineField({ name: "highlights", title: "Diferenciais", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "amenities", title: "Comodidades", description: "Somente o que existe de fato na acomodação.", type: "array", of: [{ type: "string" }] }),
    photoField({ name: "coverImage", title: "Foto de capa", description: "Usada no topo da página e nas listas. Sem capa, usa a 1ª da galeria.", requireAlt: true }),
    defineField({
      name: "gallery",
      title: "Galeria",
      description: "Sem limite de fotos; a ordem aqui é a ordem no site.",
      type: "array",
      of: [{ ...photoField({ name: "photo", title: "Foto", requireAlt: true }), type: "image" }],
    }),
    defineField({ name: "whatsappOverride", title: "WhatsApp específico (opcional)", description: "Sem isto, usa o WhatsApp do grupo.", type: "reference", to: [{ type: "whatsappContact" }] }),
    defineField({
      name: "beds24RoomId",
      title: "Beds24 roomId",
      description: "Sem este campo, o site mostra 'Consultar disponibilidade' e não monta link de reserva com quarto.",
      type: "number",
      fieldset: "booking",
      validation: (r) => r.custom((v) => validateBeds24RoomId(v as number | undefined)),
    }),
    defineField({
      name: "ocupacaoReferencia",
      title: "Ocupação de referência (adultos)",
      description: "Usada no cálculo do 'A partir de'. Padrão 2; grupos usam valor maior.",
      type: "number",
      initialValue: 2,
      fieldset: "booking",
      validation: (r) => r.custom((v) => validateOcupacaoReferencia(v as number | undefined)),
    }),
    defineField({ name: "mostrarOcupacaoBase", title: "Mostrar ocupação-base junto ao preço", type: "boolean", initialValue: false, fieldset: "booking" }),
    defineField({ name: "seoTitle", title: "SEO título", type: "string", fieldset: "seo" }),
    defineField({ name: "seoDescription", title: "SEO descrição", type: "text", rows: 3, fieldset: "seo" }),
  ],
  preview: { select: { title: "name", subtitle: "tagline", media: "coverImage" } },
  orderings: [{ title: "Ordem", name: "order", by: [{ field: "order", direction: "asc" }] }],
});
