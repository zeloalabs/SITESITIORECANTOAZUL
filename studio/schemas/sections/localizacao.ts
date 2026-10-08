import { defineField, defineType } from "sanity";

export const localizacao = defineType({
  name: "localizacao",
  title: "Localização (mapa)",
  type: "object",
  description: "O endereço do mapa vem das Configurações do site.",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", initialValue: "Localização", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Texto", type: "text", rows: 2 }),
    defineField({ name: "note", title: "Nota", type: "string" }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Localização" }) },
});
