import { defineField, defineType } from "sanity";

export const whatsappContact = defineType({
  name: "whatsappContact",
  title: "Contato WhatsApp",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Rótulo", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "number",
      title: "Número (com DDI, só dígitos)",
      type: "string",
      validation: (r) => r.required().regex(/^\d{12,13}$/, { name: "E.164 sem +" }),
    }),
    defineField({ name: "message", title: "Mensagem pré-preenchida", type: "text", rows: 3 }),
    defineField({
      name: "placements",
      title: "Onde aparece",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["header", "footer", "floating", "page"] },
    }),
  ],
});
