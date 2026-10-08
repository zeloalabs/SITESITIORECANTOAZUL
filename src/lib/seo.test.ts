import { describe, expect, it } from "vitest";
import { buildMetadata } from "./seo";
import { normalizeSettings } from "./content/normalize";

const settings = normalizeSettings({ siteName: "Sítio Recanto Azul", seoTitle: "Sítio Recanto Azul — Alfredo Wagner", seoDescription: "Descrição padrão." });

describe("buildMetadata", () => {
  it("Home usa o título padrão absoluto e canonical /", () => {
    const m = buildMetadata({ path: "/", settings });
    expect(m.title).toEqual({ absolute: "Sítio Recanto Azul — Alfredo Wagner" });
    expect(m.alternates?.canonical).toBe("/");
  });
  it("página interna usa título e descrição próprios", () => {
    const m = buildMetadata({ path: "/extras", title: "Extras", description: "Decorações.", settings });
    expect(m.title).toBe("Extras");
    expect(m.description).toBe("Decorações.");
  });
  it("sem descrição própria herda a padrão", () => {
    expect(buildMetadata({ path: "/faq", title: "FAQ", settings }).description).toBe("Descrição padrão.");
  });
  it("imagem placeholder não vai para o Open Graph", () => {
    const m = buildMetadata({ path: "/", settings, image: { src: "data:x", alt: "", placeholder: true } });
    expect((m.openGraph as { images?: unknown }).images).toBeUndefined();
  });
  it("imagem real vira og:image", () => {
    const m = buildMetadata({ path: "/", settings, image: { src: "https://cdn/x?w=800", full: "https://cdn/x?w=2400", alt: "" } });
    expect((m.openGraph as { images: { url: string }[] }).images[0]!.url).toBe("https://cdn/x?w=2400");
  });
});
