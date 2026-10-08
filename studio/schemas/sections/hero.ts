import { defineField, defineType } from "sanity";
import { photoField } from "../fields";

export const hero = defineType({
  name: "hero",
  title: "Hero (topo com foto)",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Rótulo (não usado no layout atual)", type: "string", hidden: true }),
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Frase de apoio", type: "text", rows: 3 }),
    photoField({ name: "image", title: "Foto" }),
    defineField({ name: "showSearch", title: "Mostrar chamada de disponibilidade", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "title", media: "image" }, prepare: ({ title, media }) => ({ title, subtitle: "Hero", media }) },
});
