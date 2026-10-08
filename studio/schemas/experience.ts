import { defineField, defineType } from "sanity";
import { photoField } from "./fields";

export const experience = defineType({
  name: "experience",
  title: "Experiência",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Descrição", type: "text", rows: 3, validation: (r) => r.required() }),
    photoField({ name: "image", title: "Foto (opcional)" }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
    defineField({ name: "showOnHome", title: "Mostrar na Home", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "name", subtitle: "text", media: "image" } },
});
