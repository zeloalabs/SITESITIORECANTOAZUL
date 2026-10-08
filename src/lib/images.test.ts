import { describe, expect, it } from "vitest";
import { focusOf, parseImageRef, placeholderImg, resolveImage, sanityImageUrl } from "./images";

const REF = "image-abc123DEF-3000x2000-jpg";

describe("parseImageRef", () => {
  it("lê id, dimensões e extensão", () => {
    expect(parseImageRef(REF)).toEqual({ id: "abc123DEF", width: 3000, height: 2000, ext: "jpg" });
  });
  it("rejeita referências inválidas", () => {
    expect(parseImageRef("file-abc-pdf")).toBeNull();
    expect(parseImageRef("image-abc-3000-jpg")).toBeNull();
  });
});

describe("sanityImageUrl", () => {
  it("monta URL do CDN com largura e formato automático", () => {
    const url = sanityImageUrl(REF, 800)!;
    expect(url).toMatch(/^https:\/\/cdn\.sanity\.io\/images\/[^/]+\/[^/]+\/abc123DEF-3000x2000\.jpg\?/);
    expect(url).toContain("w=800");
    expect(url).toContain("auto=format");
  });
  it("não pede largura maior que a original", () => {
    expect(sanityImageUrl("image-x-600x400-png", 2400)).toContain("w=600");
  });
});

describe("focusOf", () => {
  it("converte hotspot em object-position", () => {
    expect(focusOf({ x: 0.7, y: 0.25 })).toBe("70% 25%");
    expect(focusOf(undefined)).toBeUndefined();
  });
  it("limita valores fora de 0..1", () => {
    expect(focusOf({ x: 2, y: -1 })).toBe("100% 0%");
  });
});

describe("placeholderImg", () => {
  it("é identificável e não usa rede", () => {
    const p = placeholderImg("Ágata — capa");
    expect(p.placeholder).toBe(true);
    expect(p.src.startsWith("data:image/svg+xml")).toBe(true);
    expect(decodeURIComponent(p.src)).toContain("FOTO PENDENTE");
  });
});

describe("resolveImage", () => {
  it("devolve placeholder quando não há foto no CMS", () => {
    expect(resolveImage(null, { label: "Hero" }).placeholder).toBe(true);
    expect(resolveImage({ ref: null }, { label: "Hero" }).placeholder).toBe(true);
  });
  it("gera srcSet, foco, dimensões e alt", () => {
    const img = resolveImage({ ref: REF, alt: " Vista ", hotspot: { x: 0.5, y: 0.4 }, dims: { width: 3000, height: 2000 } }, { label: "x" });
    expect(img.placeholder).toBeUndefined();
    expect(img.alt).toBe("Vista");
    expect(img.focus).toBe("50% 40%");
    expect(img.srcSet).toContain("480w");
    expect(img.srcSet).toContain("2400w");
    expect(img.width).toBe(3000);
    expect(img.full).toContain("w=2400");
  });
  it("usa o alt de fallback quando o CMS não tem", () => {
    expect(resolveImage({ ref: REF }, { label: "x", alt: "Domo Estelar" }).alt).toBe("Domo Estelar");
  });
});
