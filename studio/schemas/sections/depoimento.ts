import { defineField, defineType } from "sanity";

export const depoimento = defineType({
  name: "depoimento",
  title: "Depoimento",
  type: "object",
  fields: [defineField({ name: "review", title: "Depoimento (opcional)", description: "Sem escolha, usa o depoimento aprovado em destaque.", type: "reference", to: [{ type: "review" }] })],
  preview: { prepare: () => ({ title: "Depoimento" }) },
});
