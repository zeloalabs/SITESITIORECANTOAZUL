import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Depoimento",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Texto", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "author", title: "Autor", type: "string", validation: (r) => r.required() }),
    defineField({ name: "source", title: "Origem", description: "Ex.: Airbnb, Google, Booking.", type: "string" }),
    defineField({ name: "when", title: "Quando", description: "Ex.: setembro de 2025.", type: "string" }),
    defineField({ name: "approved", title: "Aprovado para exibição", description: "Só depoimentos aprovados aparecem no site.", type: "boolean", initialValue: false }),
    defineField({ name: "featured", title: "Destaque na Home", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "author", subtitle: "quote" } },
});
