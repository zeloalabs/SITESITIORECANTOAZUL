import { defineField, defineType } from "sanity";
import { photoField } from "./fields";

export const extra = defineType({
  name: "extra",
  title: "Extra",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Descrição", type: "text", rows: 3 }),
    photoField({ name: "image", title: "Foto" }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
    defineField({ name: "groups", title: "Disponível nos grupos", type: "array", of: [{ type: "reference", to: [{ type: "accommodationGroup" }] }] }),
    defineField({ name: "accommodations", title: "Ou em acomodações específicas", type: "array", of: [{ type: "reference", to: [{ type: "accommodation" }] }] }),
  ],
  preview: { select: { title: "name", subtitle: "description", media: "image" } },
});
