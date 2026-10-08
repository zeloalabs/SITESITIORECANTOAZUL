import { defineField, defineType } from "sanity";
import { photoField } from "../fields";

export const chamadaFinal = defineType({
  name: "chamadaFinal",
  title: "Chamada final (reservar / WhatsApp)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    photoField({ name: "image", title: "Foto de fundo" }),
  ],
  preview: { select: { title: "title", media: "image" }, prepare: ({ title, media }) => ({ title, subtitle: "Chamada final", media }) },
});
