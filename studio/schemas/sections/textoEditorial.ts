import { defineField, defineType } from "sanity";

export const textoEditorial = defineType({
  name: "textoEditorial",
  title: "Texto editorial",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Rótulo", type: "string" }),
    defineField({ name: "title", title: "Título", type: "string" }),
    defineField({ name: "body", title: "Texto", type: "array", of: [{ type: "block" }] }),
  ],
});
