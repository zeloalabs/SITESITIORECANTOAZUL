import { defineField, defineType } from "sanity";

export const cabecalhoPagina = defineType({
  name: "cabecalhoPagina",
  title: "Cabeçalho de página",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "lead", title: "Frase de apoio", type: "text", rows: 2 }),
    defineField({ name: "whatsappKey", title: "Botão de WhatsApp (contato)", description: "Identificador do contato (ex.: casamentos). Vazio = sem botão.", type: "string" }),
    defineField({ name: "whatsappLabel", title: "Texto do botão", type: "string", initialValue: "Falar pelo WhatsApp" }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Cabeçalho de página" }) },
});
