import { defineField, defineType } from "sanity";

export const contatoBloco = defineType({
  name: "contatoBloco",
  title: "Contatos",
  type: "object",
  description: "Lista WhatsApp, e-mail, Instagram e endereço das Configurações do site.",
  fields: [defineField({ name: "title", title: "Título", type: "string", initialValue: "Fale com a gente" })],
  preview: { prepare: () => ({ title: "Contatos" }) },
});
