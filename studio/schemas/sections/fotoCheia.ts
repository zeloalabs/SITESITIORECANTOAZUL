import { defineField, defineType } from "sanity";
import { photoField } from "../fields";

export const fotoCheia = defineType({
  name: "fotoCheia",
  title: "Foto em tela cheia",
  type: "object",
  fields: [photoField({ name: "image", title: "Foto" }), defineField({ name: "caption", title: "Legenda", type: "string" })],
  preview: { select: { title: "caption", media: "image" }, prepare: ({ title, media }) => ({ title: title ?? "Foto em tela cheia", subtitle: "Foto cheia", media }) },
});
