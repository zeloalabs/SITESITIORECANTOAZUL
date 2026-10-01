import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Página",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", description: "Use 'home' para a página inicial.", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "sections", title: "Seções", type: "array", of: [{ type: "hero" }, { type: "textoEditorial" }] }),
    defineField({ name: "seoTitle", title: "SEO título", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO descrição", type: "text", rows: 3 }),
  ],
});
