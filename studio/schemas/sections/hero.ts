import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Rótulo", type: "string" }),
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Texto", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Foto", type: "image", options: { hotspot: true }, fields: [{ name: "alt", title: "Texto alternativo", type: "string" }] }),
    defineField({ name: "showSearch", title: "Mostrar busca", type: "boolean", initialValue: true }),
  ],
});
