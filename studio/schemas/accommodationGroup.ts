import { defineField, defineType } from "sanity";

export const accommodationGroup = defineType({
  name: "accommodationGroup",
  title: "Grupo de acomodações",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nome", description: "Ex.: Românticas, Para grupos.", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
    defineField({ name: "intro", title: "Texto curto (opcional)", type: "text", rows: 2 }),
    defineField({ name: "whatsapp", title: "WhatsApp do grupo", type: "reference", to: [{ type: "whatsappContact" }] }),
    defineField({ name: "showOnHome", title: "Mostrar na Home", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "name", subtitle: "intro" } },
});
