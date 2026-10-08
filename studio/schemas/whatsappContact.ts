import { defineField, defineType } from "sanity";

export function validateWhatsappNumber(value: string | undefined, hasNumberFrom: boolean): true | string {
  if (!value) return hasNumberFrom ? true : "Informe o número ou escolha de qual contato herdar";
  return /^\d{12,13}$/.test(value) ? true : "Use DDI + DDD + número, só dígitos (ex.: 5548999999999)";
}

export const whatsappContact = defineType({
  name: "whatsappContact",
  title: "Contato WhatsApp",
  type: "document",
  fields: [
    defineField({ name: "key", title: "Identificador", description: "Ex.: romanticas, grupos, casamentos. Não mude depois de publicado.", type: "string", validation: (r) => r.required().regex(/^[a-z0-9-]+$/, { name: "minúsculas, números e hífen" }) }),
    defineField({ name: "label", title: "Rótulo", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "number",
      title: "Número (com DDI, só dígitos)",
      type: "string",
      validation: (r) => r.custom((v, ctx) => validateWhatsappNumber(v as string | undefined, Boolean((ctx.document as { numberFrom?: unknown } | undefined)?.numberFrom))),
    }),
    defineField({ name: "numberFrom", title: "Herdar número de outro contato", description: "Ex.: Casamentos usa o número de 'Para grupos', com mensagem própria.", type: "reference", to: [{ type: "whatsappContact" }] }),
    defineField({ name: "message", title: "Mensagem pré-preenchida", description: "Pode usar {acomodacao} para o nome da acomodação.", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
    defineField({
      name: "placements",
      title: "Onde aparece",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["header", "footer", "floating", "page"] },
    }),
  ],
  preview: { select: { title: "label", subtitle: "number" } },
});
