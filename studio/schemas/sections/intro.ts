import { defineField, defineType } from "sanity";
import { photoField } from "../fields";

export const intro = defineType({
  name: "intro",
  title: "Introdução (texto + 2 fotos)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Texto", type: "text", rows: 4 }),
    defineField({ name: "facts", title: "Fatos em destaque (frases curtas)", description: "Ex.: um diferencial confirmado do sítio. Aparecem discretos, abaixo do texto.", type: "array", of: [{ type: "string" }], validation: (r) => r.max(4) }),
    defineField({
      name: "photos",
      title: "Fotos (até 2)",
      type: "array",
      validation: (r) => r.max(2),
      of: [{ type: "object", name: "captioned", fields: [photoField({ name: "image", title: "Foto" }), defineField({ name: "caption", title: "Legenda", type: "string" })], preview: { select: { title: "caption", media: "image" } } }],
    }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Introdução" }) },
});
