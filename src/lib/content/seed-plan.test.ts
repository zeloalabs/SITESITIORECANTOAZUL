import { describe, expect, it } from "vitest";
import { planSeed } from "./seed-plan";
import { seedDocuments } from "./seed";

const doc = (id: string) => seedDocuments.find((d) => d._id === id)!;

describe("planSeed", () => {
  it("cria o que não existe", () => {
    expect(planSeed(null, doc("faq-1"))).toBe("create");
  });
  it("mantém documento já existente (não sobrescreve edição)", () => {
    expect(planSeed({ _id: "faq-1", question: "editada" }, doc("faq-1"))).toBe("skip");
    expect(planSeed({ _id: "siteSettings", siteName: "X" }, doc("siteSettings"))).toBe("skip");
  });
  it("substitui stubs de acomodação da Fase 1 e mantém os já migrados", () => {
    expect(planSeed({ _id: "accommodation-agata", beds24RoomId: 737422 }, doc("accommodation-agata"))).toBe("replace");
    expect(planSeed({ tagline: "x", group: { _ref: "g" } }, doc("accommodation-agata"))).toBe("skip");
  });
  it("substitui a Home de teste, mas não uma Home já migrada", () => {
    expect(planSeed({ sections: [{ _type: "hero" }] }, doc("page-home"))).toBe("replace");
    expect(planSeed({ sections: [{ _type: "acomodacoes" }] }, doc("page-home"))).toBe("skip");
  });
  it("--force substitui tudo", () => {
    expect(planSeed({ _id: "faq-1" }, doc("faq-1"), true)).toBe("replace");
  });
});

describe("seed", () => {
  it("ids únicos e referências apontam para documentos da seed", () => {
    const ids = seedDocuments.map((d) => d._id);
    expect(new Set(ids).size).toBe(ids.length);
    const refs: string[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        if (o._type === "reference" && typeof o._ref === "string") refs.push(o._ref);
        Object.values(o).forEach(walk);
      }
    };
    walk(seedDocuments);
    for (const r of refs) expect(ids).toContain(r);
  });
  it("não contém preço nem número de telefone inventado", () => {
    const json = JSON.stringify(seedDocuments);
    expect(json).not.toMatch(/R\$/);
    expect(json).not.toMatch(/"number":/);
  });
});
