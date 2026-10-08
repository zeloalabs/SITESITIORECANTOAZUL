import { defineField, defineType } from "sanity";

export const extrasLista = defineType({
  name: "extrasLista",
  title: "Lista de extras",
  type: "object",
  fields: [defineField({ name: "whatsappKey", title: "WhatsApp dos botões (contato)", type: "string", initialValue: "romanticas" })],
  preview: { prepare: () => ({ title: "Lista de extras" }) },
});
