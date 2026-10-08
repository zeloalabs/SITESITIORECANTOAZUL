import { defineField, defineType } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "Pergunta frequente",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Pergunta", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Resposta", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "question", subtitle: "answer" } },
});
