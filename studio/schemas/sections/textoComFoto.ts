import { defineField, defineType } from "sanity";
import { photoField } from "../fields";

export const textoComFoto = defineType({
  name: "textoComFoto",
  title: "Texto com foto",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Texto", description: "Separe parágrafos com uma linha em branco.", type: "text", rows: 6 }),
    photoField({ name: "image", title: "Foto" }),
  ],
  preview: { select: { title: "title", media: "image" }, prepare: ({ title, media }) => ({ title, subtitle: "Texto com foto", media }) },
});
