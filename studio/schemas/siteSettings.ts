import { defineField, defineType } from "sanity";
import { validateHref } from "./fields";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configurações do site",
  type: "document",
  fieldsets: [
    { name: "contact", title: "Contato e rodapé" },
    { name: "map", title: "Mapa" },
    { name: "seo", title: "SEO padrão" },
    { name: "beds24", title: "Beds24", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: "siteName", title: "Nome", type: "string", initialValue: "Sítio Recanto Azul", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logo (SVG)", type: "image" }),
    defineField({ name: "tagline", title: "Frase de apresentação", type: "string" }),
    defineField({ name: "place", title: "Local (rodapé)", description: "Ex.: Alfredo Wagner · SC.", type: "string", fieldset: "contact" }),
    defineField({ name: "email", title: "E-mail", type: "string", fieldset: "contact", validation: (r) => r.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: "e-mail" }) }),
    defineField({ name: "instagramUrl", title: "Instagram (endereço completo)", type: "url", fieldset: "contact", validation: (r) => r.uri({ scheme: ["https"] }) }),
    defineField({ name: "address", title: "Endereço", type: "string", fieldset: "contact" }),
    defineField({ name: "mapsUrl", title: "Link do Google Maps", type: "url", fieldset: "map", validation: (r) => r.uri({ scheme: ["https"] }) }),
    defineField({ name: "mapsEmbedUrl", title: "Endereço do mapa incorporado", type: "url", fieldset: "map", validation: (r) => r.uri({ scheme: ["https"] }) }),
    defineField({ name: "galleryInitial", title: "Fotos visíveis antes de 'Ver todas'", type: "number", initialValue: 8, validation: (r) => r.integer().min(1).max(30) }),
    defineField({ name: "seoTitle", title: "SEO título padrão", type: "string", fieldset: "seo" }),
    defineField({ name: "seoDescription", title: "SEO descrição padrão", type: "text", rows: 3, fieldset: "seo" }),
    defineField({ name: "beds24PropertyId", title: "Beds24 propertyId", type: "number", fieldset: "beds24", validation: (r) => r.integer().positive() }),
    defineField({ name: "beds24Referer", title: "Beds24 referer", description: "Identifica reservas originadas no site.", type: "string", initialValue: "site-v2", fieldset: "beds24" }),
    defineField({ name: "bookingUrlOverride", title: "Link de reserva alternativo (opcional)", description: "Sem isto, o 'Reservar' abre o motor da Beds24 da propriedade.", type: "string", fieldset: "beds24", validation: (r) => r.custom((v) => validateHref(v as string | undefined)) }),
  ],
});
