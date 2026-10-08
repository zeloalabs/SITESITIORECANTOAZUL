import { defineField, defineType } from "sanity";
import { photoField, validateHref } from "../fields";

export const blocosDestaque = defineType({
  name: "blocosDestaque",
  title: "Blocos de destaque (fotos-link)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "tiles",
      title: "Blocos (2 ou 3)",
      type: "array",
      validation: (r) => r.min(1).max(3),
      of: [
        {
          type: "object",
          name: "tile",
          fields: [
            defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Texto", type: "string" }),
            photoField({ name: "image", title: "Foto" }),
            defineField({ name: "href", title: "Link", type: "string", validation: (r) => r.required().custom((v) => validateHref(v as string | undefined)) }),
          ],
          preview: { select: { title: "title", subtitle: "href", media: "image" } },
        },
      ],
    }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Blocos de destaque" }) },
});
