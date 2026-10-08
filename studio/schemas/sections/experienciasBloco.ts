import { defineField, defineType } from "sanity";
import { photoField, validateHref } from "../fields";

export const experienciasBloco = defineType({
  name: "experienciasBloco",
  title: "Experiências (lista + fotos)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", initialValue: "Experiências", validation: (r) => r.required() }),
    defineField({ name: "lead", title: "Frase de apoio", type: "string" }),
    defineField({ name: "onlyHome", title: "Só as marcadas 'Mostrar na Home'", type: "boolean", initialValue: true }),
    defineField({ name: "photos", title: "Fotos (até 3)", type: "array", validation: (r) => r.max(3), of: [photoField({ name: "photo", title: "Foto" })] }),
    defineField({ name: "linkLabel", title: "Texto do link", type: "string" }),
    defineField({ name: "linkHref", title: "Destino do link", type: "string", validation: (r) => r.custom((v) => validateHref(v as string | undefined)) }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Experiências" }) },
});
