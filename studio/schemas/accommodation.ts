import { defineField, defineType } from "sanity";

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

export const accommodation = defineType({
  name: "accommodation",
  title: "Acomodação",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "gallery", title: "Galeria", type: "array", of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", title: "Texto alternativo", type: "string" }] }] }),
    defineField({ name: "description", title: "Descrição", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "highlights", title: "Diferenciais", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "capacity", title: "Capacidade máxima", type: "number" }),
    defineField({ name: "amenities", title: "Comodidades", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "beds24RoomId",
      title: "Beds24 roomId",
      description: "Sem este campo, o site mostra 'Consultar disponibilidade' e não monta link de reserva com quarto.",
      type: "number",
      validation: (r) => r.custom((v) => validateBeds24RoomId(v as number | undefined)),
    }),
    defineField({
      name: "ocupacaoReferencia",
      title: "Ocupação de referência (adultos)",
      description: "Usada no cálculo do 'A partir de'. Padrão 2; grupos usam valor maior.",
      type: "number",
      initialValue: 2,
      validation: (r) => r.custom((v) => validateOcupacaoReferencia(v as number | undefined)),
    }),
    defineField({ name: "mostrarOcupacaoBase", title: "Mostrar ocupação-base junto ao preço", type: "boolean", initialValue: false }),
    defineField({ name: "featuredHome", title: "Destaque na Home", type: "boolean", initialValue: false }),
    defineField({ name: "homeOrder", title: "Ordem na Home", type: "number" }),
    defineField({ name: "seoTitle", title: "SEO título", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO descrição", type: "text", rows: 3 }),
  ],
});
