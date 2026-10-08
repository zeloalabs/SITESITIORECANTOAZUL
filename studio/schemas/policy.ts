import { defineField, defineType } from "sanity";

export const policy = defineType({
  name: "policy",
  title: "Política",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "anchor", title: "Âncora (link interno)", description: "Ex.: privacidade, hospedagem, pagamento.", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "body", title: "Texto", description: "Separe parágrafos com uma linha em branco.", type: "text", rows: 10, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});
