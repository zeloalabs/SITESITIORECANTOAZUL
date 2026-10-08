import { defineType } from "sanity";

export const politicasLista = defineType({
  name: "politicasLista",
  title: "Lista de políticas",
  type: "object",
  fields: [{ name: "enabled", title: "Ativo", type: "boolean", initialValue: true, hidden: true }],
  preview: { prepare: () => ({ title: "Lista de políticas" }) },
});
