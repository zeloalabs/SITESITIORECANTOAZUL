import { defineType } from "sanity";

export const faqLista = defineType({
  name: "faqLista",
  title: "Perguntas frequentes",
  type: "object",
  fields: [{ name: "enabled", title: "Ativo", type: "boolean", initialValue: true, hidden: true }],
  preview: { prepare: () => ({ title: "Perguntas frequentes" }) },
});
