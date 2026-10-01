import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configurações do site",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Nome", type: "string", initialValue: "Sítio Recanto Azul", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logo (SVG)", type: "image" }),
    defineField({ name: "seoTitle", title: "SEO título padrão", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO descrição padrão", type: "text", rows: 3 }),
    defineField({ name: "beds24PropertyId", title: "Beds24 propertyId", type: "number", validation: (r) => r.integer().positive() }),
    defineField({ name: "beds24Referer", title: "Beds24 referer", description: "Identifica reservas originadas no site.", type: "string", initialValue: "site-v2" }),
  ],
});
