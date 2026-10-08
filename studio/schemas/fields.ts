import { defineField } from "sanity";

/** Foto com ponto focal e texto alternativo. `requireAlt`: obrigatório (galerias); senão só um aviso. */
export function photoField(opts: { name: string; title: string; requireAlt?: boolean; description?: string }) {
  return defineField({
    name: opts.name,
    title: opts.title,
    description: opts.description,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Texto alternativo",
        description: "Descreva a foto para quem não a enxerga (também ajuda no Google).",
        type: "string",
        validation: (r) => (opts.requireAlt ? r.required() : r.warning("Recomendado: descreva a foto.")),
      }),
    ],
  });
}

/** Link interno (começa com /) ou externo (https://). */
export function validateHref(value: string | undefined): true | string {
  if (!value) return true;
  if (/^\/(?!\/)[^\s]*$/.test(value) || /^https:\/\/[^\s]+$/.test(value)) return true;
  return "Use um caminho do site (ex.: /extras) ou um endereço https://";
}
