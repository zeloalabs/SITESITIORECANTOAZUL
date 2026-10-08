import { defineField, defineType } from "sanity";

export const acomodacoes = defineType({
  name: "acomodacoes",
  title: "Acomodações (grupos)",
  type: "object",
  description: "Mostra os grupos marcados 'Mostrar na Home' e suas acomodações.",
  fields: [defineField({ name: "title", title: "Título", type: "string", initialValue: "Acomodações", validation: (r) => r.required() })],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Acomodações" }) },
});
